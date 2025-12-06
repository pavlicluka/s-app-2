// Browser-compatible MySQL API mock
// V produkciji se to zamenja s pravo backend implementacijo

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
  // Mock implementations that simulate database operations
  // V realni implementaciji se to poveže z backend API-jem

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
    private conditions: string = '',
    private params: any[] = [],
    private options: SelectOptions = {},
  ) {}

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    return mysqlAPI.select(this.table, this.columns, this.conditions, this.params, {
      ...this.options,
      orderBy: column,
      ascending,
    })
  }

  eq(column: string, value: any) {
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

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

class QueryBuilder {
  constructor(
    private table: string,
    private columns: string = '*',
    private conditions: string = '',
    private params: any[] = [],
    private options: SelectOptions = {},
  ) {}

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    return mysqlAPI.select(this.table, this.columns, this.conditions, this.params, {
      ...this.options,
      orderBy: column,
      ascending,
    })
  }

  eq(column: string, value: any) {
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

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Default MySQL API instance
export const mysqlAPI = new MySQLAPI()

// Legacy Supabase compatibility interface
export const supabase = {
  from: (table: string) => ({
    select: (columns = '*') => new QueryBuilder(table, columns),
    insert: (data: any) => mysqlAPI.insert(table, data),
    update: (data: any) => ({
      eq: (column: string, value: any) => mysqlAPI.update(table, data, `${column} = ?`, [value]),
    }),
    delete: () => ({
      eq: (column: string, value: any) => mysqlAPI.delete(table, `${column} = ?`, [value]),
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
  functions: {
    invoke: (_name: string, _options: any = {}) =>
      Promise.resolve({ data: null, error: 'Supabase edge functions are not available in MySQL mode' }),
  },
}

// Export MySQL API as default for backward compatibility
export default supabase

// Legacy validation function for compatibility
export function validateSupabaseConfig() {
  return true
}
