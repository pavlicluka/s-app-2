// Browser-compatible MySQL API mock
// V produkciji se to zamenja s pravo backend implementacijo

type SelectOptions = {
  orderBy?: string
  ascending?: boolean
  limit?: number
  offset?: number
}

// MySQL API wrapper - Browser compatible version
export class MySQLAPI {
  // Mock implementations that simulate database operations
  // V realni implementaciji se to poveže z backend API-jem

  async query(sql: string, params: any[] = []) {
    console.log('Mock MySQL Query:', sql, params)
    return { data: [], error: null }
  }

  async select(
    table: string,
    columns = '*',
    conditions = '',
    params: any[] = [],
    options: SelectOptions = {},
  ) {
    console.log('Mock MySQL Select:', { table, columns, conditions, params, options })
    return { data: [], error: null }
  }

  async insert(table: string, data: any) {
    console.log('Mock MySQL Insert:', table, data)
    return { data: null, error: null }
  }

  async update(table: string, data: any, conditions = '', params: any[] = []) {
    console.log('Mock MySQL Update:', table, data, conditions, params)
    return { data: null, error: null }
  }

  async delete(table: string, conditions = '', params: any[] = []) {
    console.log('Mock MySQL Delete:', table, conditions, params)
    return { data: null, error: null }
  }

  async batchDelete(table: string, ids: string[]) {
    console.log('Mock MySQL Batch Delete:', table, ids)
    return { data: null, error: null }
  }

  async batchUpdate(table: string, data: any, ids: string[]) {
    console.log('Mock MySQL Batch Update:', table, data, ids)
    return { data: null, error: null }
  }

  async searchLike(table: string, columns: string[], searchTerm: string, options: any = {}) {
    console.log('Mock MySQL Search:', table, columns, searchTerm, options)
    return { data: [], error: null }
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
