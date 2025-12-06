import mysql from 'mysql2/promise'

// MySQL povezovalni podatki
const mysqlConfig = {
  host: process.env.VITE_MYSQL_HOST || '195.35.53.6',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  database: process.env.VITE_MYSQL_DATABASE || 'u816302701_standario2025',
  user: process.env.VITE_MYSQL_USER || 'u816302701_virtual',
  password: process.env.VITE_MYSQL_PASSWORD || 'Vir007tu@l!'
}

// Vrne trenutno uporabljeno konfiguracijo (z možnostjo maskiranja gesla)
export function getResolvedMySQLConfig({ maskPassword = false } = {}) {
  return {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    user: mysqlConfig.user,
    password: maskPassword ? '***' : mysqlConfig.password,
  }
}

// MySQL connection pool
let pool = null

function getMySQLPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      database: mysqlConfig.database,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      charset: 'utf8mb4',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    })
  }
  return pool
}

// MySQL API wrapper
class MySQLAPI {
  constructor() {
    this.pool = getMySQLPool()
  }

  // Query execution
  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params)
      return { data: rows, error: null }
    } catch (error) {
      console.error('MySQL Query Error:', error)
      return { data: null, error: error.message }
    }
  }

  // Select
  async select(table, columns = '*', conditions = '', params = [], options = {}) {
    let sql = `SELECT ${columns} FROM ${table}`
    const queryParams = [...params]

    if (conditions) {
      sql += ` WHERE ${conditions}`
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.ascending === false ? 'DESC' : 'ASC'}`
    }

    if (options.limit) {
      sql += ' LIMIT ?'
      queryParams.push(options.limit)
    }

    if (options.offset) {
      sql += ' OFFSET ?'
      queryParams.push(options.offset)
    }

    return this.query(sql, queryParams)
  }

  // Insert
  async insert(table, data) {
    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values = columns.map(col => data[col])

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    return this.query(sql, values)
  }

  // Update
  async update(table, data, conditions = '', params = []) {
    const setClause = Object.keys(data).map(col => `${col} = ?`).join(', ')
    const values = [...Object.values(data), ...params]

    let sql = `UPDATE ${table} SET ${setClause}`
    if (conditions) {
      sql += ` WHERE ${conditions}`
    }
    return this.query(sql, values)
  }

  // Delete
  async delete(table, conditions = '', params = []) {
    let sql = `DELETE FROM ${table}`
    if (conditions) {
      sql += ` WHERE ${conditions}`
    }
    return this.query(sql, params)
  }

  // Test connection
  async testConnection() {
    try {
      const [rows] = await this.pool.execute('SELECT 1 as test')
      return rows.length > 0
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}

class QueryBuilder {
  constructor(table, columns = '*', conditions = '', params = [], options = {}) {
    this.table = table
    this.columns = columns
    this.conditions = conditions
    this.params = params
    this.options = options
  }

  order(column, { ascending = true } = {}) {
    return mysqlAPI.select(this.table, this.columns, this.conditions, this.params, {
      ...this.options,
      orderBy: column,
      ascending,
    })
  }

  eq(column, value) {
    return new QueryBuilder(this.table, this.columns, `${column} = ?`, [value], this.options)
  }

  async single() {
    const result = await this.execute()
    return { ...result, data: Array.isArray(result.data) ? result.data[0] ?? null : null }
  }

  async maybeSingle() {
    const result = await this.execute()
    return { ...result, data: Array.isArray(result.data) ? result.data[0] ?? null : null }
  }

  execute() {
    return mysqlAPI.select(this.table, this.columns, this.conditions, this.params, this.options)
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Default MySQL API instance
export const mysqlAPI = new MySQLAPI()

// Simple in-memory storage shim so UI code expecting storage does not crash
function createInMemoryStorage() {
  const buckets = new Map()

  const ensureBucket = (name) => {
    if (!buckets.has(name)) {
      buckets.set(name, new Map())
    }
    return buckets.get(name)
  }

  return {
    from(bucket) {
      const bucketStore = ensureBucket(bucket)

      return {
        async upload(path, file) {
          try {
            bucketStore.set(path, { path, file })
            return { data: { path }, error: null }
          } catch (error) {
            return { data: null, error: error?.message || 'Upload failed' }
          }
        },
        getPublicUrl(path) {
          const stored = bucketStore.get(path)
          return { data: { publicUrl: stored ? `memory://${bucket}/${path}` : '' }, error: null }
        },
      }
    },
  }
}

const storage = createInMemoryStorage()

export const mysqlClient = {
  from: (table) => ({
    select: (columns = '*') => new QueryBuilder(table, columns),
    insert: (data) => mysqlAPI.insert(table, data),
    update: (data) => ({
      eq: (column, value) => mysqlAPI.update(table, data, `${column} = ?`, [value]),
    }),
    delete: () => ({
      eq: (column, value) => mysqlAPI.delete(table, `${column} = ?`, [value]),
    }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage,
  functions: {
    invoke: (_name, _options = {}) =>
      Promise.resolve({ data: null, error: 'Edge functions are not available in MySQL mode' }),
  },
}

// Backward-compatible default export and alias
export const supabase = mysqlClient
export default mysqlClient
