import { MySQLAuth } from './mysql-auth'
import { mysqlAPI } from './mysql-client'

export interface AuditLogEntry {
  action_type: string
  action_description: string
  ip_address?: string
  user_agent?: string
}

export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    // Get current MySQL session user
    const { user } = MySQLAuth.getSession()
    
    if (!user) {
      console.warn('No user found for audit log')
      return
    }

    const { error } = await mysqlAPI.insert('audit_logs', {
      user_id: user.id,
      action_type: entry.action_type,
      action_description: entry.action_description,
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || navigator.userAgent
    })

    if (error) {
      console.error('Failed to log audit action:', error)
    }
  } catch (error) {
    console.error('Error logging audit action:', error)
  }
}

export const AuditActionTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_EDIT: 'profile_edit',
  PASSWORD_CHANGE: 'password_change',
  DATA_EXPORT: 'data_export',
  SETTINGS_CHANGE: 'settings_change',
  VIEW_PAGE: 'view_page',
  ORGANIZATION_SWITCH: 'organization_switch'
} as const
