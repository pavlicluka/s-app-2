import type { Plugin } from 'vite'

/**
 * Vite plugin to inject MySQL environment variables into index.html at build time
 * This ensures that database connection parameters are available in the deployed app
 */
export function envInjectPlugin(): Plugin {
  return {
    name: 'env-inject',
    transformIndexHtml(html) {
      // MySQL connection parameters
      const mysqlHost = process.env.VITE_MYSQL_HOST || '195.35.53.6'
      const mysqlPort = process.env.VITE_MYSQL_PORT || '3306'
      const mysqlDatabase = process.env.VITE_MYSQL_DATABASE || 'u816302701_standario2025'
      const mysqlUser = process.env.VITE_MYSQL_USER || 'u816302701_virtual'
      const mysqlPassword = process.env.VITE_MYSQL_PASSWORD || 'Vir007tu@l!'
      const jwtSecret = process.env.VITE_JWT_SECRET || 'standario-jwt-secret-key-2025'
      
      console.log('🔧 MySQL Env Inject Plugin - Connection parameters:', {
        host: mysqlHost,
        port: mysqlPort,
        database: mysqlDatabase,
        user: mysqlUser,
        hasPassword: !!mysqlPassword
      })
      
      // Replace placeholders with actual environment variable values
      return html
        .replace('%VITE_MYSQL_HOST%', mysqlHost)
        .replace('%VITE_MYSQL_PORT%', mysqlPort)
        .replace('%VITE_MYSQL_DATABASE%', mysqlDatabase)
        .replace('%VITE_MYSQL_USER%', mysqlUser)
        .replace('%VITE_MYSQL_PASSWORD%', mysqlPassword)
        .replace('%VITE_JWT_SECRET%', jwtSecret)
    }
  }
}
