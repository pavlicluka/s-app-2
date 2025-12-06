import mysql from 'mysql2/promise'

// MySQL povezovalni podatki
const mysqlConfig = {
  host: process.env.VITE_MYSQL_HOST || '195.35.53.6',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  database: process.env.VITE_MYSQL_DATABASE || 'u816302701_standario2025',
  user: process.env.VITE_MYSQL_USER || 'u816302701_virtual',
  password: process.env.VITE_MYSQL_PASSWORD || 'Vir007tu@l!'
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
  async select(table, columns = '*', conditions = '', params = []) {
    let sql = `SELECT ${columns} FROM ${table}`
    if (conditions) {
      sql += ` WHERE ${conditions}`
    }
    return this.query(sql, params)
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

// Default MySQL API instance
export const mysqlAPI = new MySQLAPI()

// Legacy Supabase compatibility interface
export const supabase = {
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        single: async () => mysqlAPI.select(table, columns, `${column} = ?`, [value]),
        execute: async () => mysqlAPI.select(table, columns, `${column} = ?`, [value])
      }),
      order: (column, { ascending = true } = {}) => ({
        execute: async () => mysqlAPI.select(table, columns, '', [])
      })
    }),
    insert: (data) => ({
      execute: async () => mysqlAPI.insert(table, data)
    }),
    update: (data) => ({
      eq: (column, value) => ({
        execute: async () => mysqlAPI.update(table, data, `${column} = ?`, [value])
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        execute: async () => mysqlAPI.delete(table, `${column} = ?`, [value])
      })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
}

// Export MySQL API as default for backward compatibility
export default supabase