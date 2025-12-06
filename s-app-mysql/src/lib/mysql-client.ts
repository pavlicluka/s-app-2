// Browser-compatible MySQL API shim
// V produkciji se to zamenja s pravo backend implementacijo, ki namesto Supabase uporablja MySQL

type SelectOptions = {
  orderBy?: string
  ascending?: boolean
  limit?: number
  offset?: number
}

// MySQL API wrapper - Browser compatible version
const API_BASE_URL = import.meta.env.VITE_MYSQL_API_URL || '/api'

async function postJSON<T>(path: string, body: any): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Request failed with status ${response.status}`)
    }

    const json = await response.json()
    if (json && json.success !== false) {
      return { data: json.data ?? null, error: null }
    }

    return { data: null, error: json?.error || 'Unknown error' }
  } catch (error: any) {
    console.error('MySQL API request failed:', error)
    return { data: null, error: error.message || 'Unknown error' }
  }
}

export class MySQLAPI {
  async login(email: string, password: string) {
    return postJSON<any>('/auth/login', { email, password })
  }

  async query(sql: string, params: any[] = []) {
    return postJSON<any>('/mysql/query', { sql, params })
  }

  async select(
    table: string,
    columns = '*',
    conditions = '',
    params: any[] = [],
    options: SelectOptions = {},
  ) {
    return postJSON<any[]>('/mysql/select', { table, columns, conditions, params, options })
  }

  async insert(table: string, data: any) {
    return postJSON('/mysql/insert', { table, data })
  }

  async update(table: string, data: any, conditions = '', params: any[] = []) {
    return postJSON('/mysql/update', { table, data, conditions, params })
  }

  async delete(table: string, conditions = '', params: any[] = []) {
    return postJSON('/mysql/delete', { table, conditions, params })
  }

  async batchDelete(table: string, ids: string[]) {
    return postJSON('/mysql/batch-delete', { table, ids })
  }

  async batchUpdate(table: string, data: any, ids: string[]) {
    return postJSON('/mysql/batch-update', { table, data, ids })
  }

  async searchLike(table: string, columns: string[], searchTerm: string, options: any = {}) {
    return postJSON<any[]>('/mysql/search', { table, columns, searchTerm, options })
  }
}

class QueryBuilder {
  constructor(
    private table: string,
    private columns: string = '*',
    private filters: string[] = [],
    private params: any[] = [],
    private options: SelectOptions = {},
  ) {}

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    return new QueryBuilder(this.table, this.columns, this.filters, this.params, {
      ...this.options,
      orderBy: column,
      ascending,
    })
  }

  limit(count: number) {
    return new QueryBuilder(this.table, this.columns, this.filters, this.params, {
      ...this.options,
      limit: count,
    })
  }

  eq(column: string, value: any) {
    return new QueryBuilder(
      this.table,
      this.columns,
      [...this.filters, `${column} = ?`],
      [...this.params, value],
      this.options,
    )
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
    const conditions = this.filters.join(' AND ')
    return mysqlAPI.select(this.table, this.columns, conditions, this.params, this.options)
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

class InsertBuilder {
  constructor(private table: string, private payload: any) {}

  async select(columns = '*') {
    const result = await mysqlAPI.insert(this.table, this.payload)
    if (result.error) return result

    // If the payload already contains an id we can return the inserted row
    const insertedId = Array.isArray(this.payload) ? this.payload[0]?.id : this.payload?.id
    if (!insertedId) return { data: result.data, error: null }

    return mysqlAPI.select(this.table, columns, 'id = ?', [insertedId])
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    return mysqlAPI.insert(this.table, this.payload).then(onfulfilled, onrejected)
  }
}

class UpdateBuilder {
  constructor(private table: string, private payload: any, private filters: string[] = [], private params: any[] = []) {}

  eq(column: string, value: any) {
    return new UpdateBuilder(this.table, this.payload, [...this.filters, `${column} = ?`], [...this.params, value])
  }

  async select(columns = '*') {
    const conditions = this.filters.join(' AND ')
    const updateResult = await mysqlAPI.update(this.table, this.payload, conditions, this.params)
    if (updateResult.error) return updateResult

    if (!conditions) return { data: updateResult.data, error: null }
    return mysqlAPI.select(this.table, columns, conditions, this.params)
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    const conditions = this.filters.join(' AND ')
    return mysqlAPI.update(this.table, this.payload, conditions, this.params).then(onfulfilled, onrejected)
  }
}

class DeleteBuilder {
  constructor(private table: string, private filters: string[] = [], private params: any[] = []) {}

  eq(column: string, value: any) {
    return new DeleteBuilder(this.table, [...this.filters, `${column} = ?`], [...this.params, value])
  }

  select(columns = '*') {
    const conditions = this.filters.join(' AND ')
    return mysqlAPI.select(this.table, columns, conditions, this.params)
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    const conditions = this.filters.join(' AND ')
    return mysqlAPI.delete(this.table, conditions, this.params).then(onfulfilled, onrejected)
  }
}

// Default MySQL API instance
export const mysqlAPI = new MySQLAPI()

type StoredObject = { url: string; path: string }

function createInMemoryStorage() {
  const buckets = new Map<string, Map<string, StoredObject>>()

  const ensureBucket = (name: string) => {
    if (!buckets.has(name)) {
      buckets.set(name, new Map())
    }
    return buckets.get(name) as Map<string, StoredObject>
  }

  return {
    from(bucket: string) {
      const bucketStore = ensureBucket(bucket)

      return {
        async upload(path: string, file: File) {
          try {
            const objectUrl = URL.createObjectURL(file)
            bucketStore.set(path, { url: objectUrl, path })
            return { data: { path }, error: null }
          } catch (error: any) {
            return { data: null, error: error?.message || 'Upload failed' }
          }
        },

        getPublicUrl(path: string) {
          const stored = bucketStore.get(path)
          const publicUrl = stored?.url || ''
          return { data: { publicUrl }, error: null }
        },
      }
    },
  }
}

const storage = createInMemoryStorage()

// Supabase-like interface renamed to mysqlClient for MySQL-only mode
export const mysqlClient = {
  from: (table: string) => ({
    select: (columns = '*') => new QueryBuilder(table, columns),
    insert: (data: any) => new InsertBuilder(table, data),
    update: (data: any) => new UpdateBuilder(table, data),
    delete: () => new DeleteBuilder(table),
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
    invoke: (_name: string, _options: any = {}) =>
      Promise.resolve({ data: null, error: 'Edge functions are disabled in MySQL-only mode' }),
  },
}

// Backward-compatible alias so existing imports keep working while the app runs purely on MySQL
export const supabase = mysqlClient

// Export MySQL client as default
export default mysqlClient
