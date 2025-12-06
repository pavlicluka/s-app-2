/**
 * MySQL Auth utilities
 * Avtentikacija za Standario aplikacijo
 */

import jwt from 'jsonwebtoken'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  organization_id?: number
  role: string
}

export interface AuthToken {
  token: string
  expires: Date
}

// JWT konfiguracija
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'standario-jwt-secret-key-2025'
const JWT_EXPIRES_IN = '24h'

export class MySQLAuth {
  // Generiranje JWT tokena
  static generateToken(user: User): AuthToken {
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 ur

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'standario',
        audience: 'standario-web'
      }
    )

    return { token, expires }
  }

  // Preverjanje JWT tokena
  static verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      } as User
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  // Hashiranje gesla (za prihodnost)
  static async hashPassword(password: string): Promise<string> {
    // Zaenkrat enostavno hashiranje - v produkciji uporabi bcrypt
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'standario-salt-2025') // Uporabi isti salt kot AuthContext
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Preverjanje gesla (za prihodnost)
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password)
    return hashedPassword === hash
  }

  // Session management
  static saveSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('standario_session', token)
      localStorage.setItem('standario_user', JSON.stringify(user))
    }
  }

  static getSession(): { token: string | null, user: User | null } {
    if (typeof window === 'undefined') {
      return { token: null, user: null }
    }

    const token = localStorage.getItem('standario_session')
    const userData = localStorage.getItem('standario_user')

    if (!token || !userData) {
      return { token: null, user: null }
    }

    const user = this.verifyToken(token)
    if (!user) {
      this.clearSession()
      return { token: null, user: null }
    }

    try {
      const parsedUser = JSON.parse(userData)
      return { token, user: { ...user, ...parsedUser } }
    } catch {
      this.clearSession()
      return { token: null, user: null }
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('standario_session')
      localStorage.removeItem('standario_user')
    }
  }
}
