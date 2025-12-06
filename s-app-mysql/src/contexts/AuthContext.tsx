import React, { createContext, useContext, useEffect, useState } from 'react'
import { mysqlAPI } from '../lib/mysql-client'
import { MySQLAuth, type User as AuthUser } from '../lib/mysql-auth'
import { logAuditAction, AuditActionTypes } from '../lib/auditLog'

// MySQL authentication configured

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  // Organization context methods
  switchOrganization: (organizationId: string) => Promise<void>
  getAvailableOrganizations: () => Promise<Array<{id: string, name: string, role: string}>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track if component is still mounted
    let isMounted = true

    // Load user on mount
    async function loadUser() {
      console.log('🔄 AuthContext: MySQL loadUser - začenjam nalaganje uporabnika')
      if (!isMounted) {
        console.log('🔴 AuthContext: MySQL loadUser - component already unmounted, aborting')
        return
      }
      
      setLoading(true)
      try {
        // Check for existing MySQL session
        const { token, user: cachedUser } = MySQLAuth.getSession()
        
        if (token && cachedUser && isMounted) {
          console.log('✅ AuthContext: MySQL User loaded from session')
          setUser(cachedUser)
        } else if (isMounted) {
          setUser(null)
        }
      } catch (err: any) {
        console.error('❌ AuthContext: MySQL loadUser - nepričakovana napaka:', err)
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    console.log('🔐 AuthContext: MySQL signIn - poskušam se prijaviti', normalizedEmail)
    setLoading(true)

    try {
      // MySQL avtentikacija - poišči uporabnika v bazi
      const { data: profiles, error } = await mysqlAPI.select('profiles', '*', 'email = ?', [normalizedEmail])
      
      if (error) {
        throw new Error('Napaka pri povezavi z bazo podatkov')
      }
      
      if (!profiles || profiles.length === 0) {
        throw new Error('Uporabnik s tem e-poštnim naslovom ne obstaja')
      }
      
      const profile = profiles[0]
      
      // Hashiraj vnešeno geslo in ga primerjaj
      const hashedPassword = await hashPassword(password)

      const legacyPassword = profile.password || profile.raw_password || profile.passwordHash
      const storedHash = profile.password_hash || legacyPassword

      const passwordMatches =
        (typeof storedHash === 'string' && (storedHash === hashedPassword || storedHash === password)) ||
        (typeof legacyPassword === 'string' && (legacyPassword === password || legacyPassword === hashedPassword))

      if (!passwordMatches) {
        throw new Error('Neveljavni prijavni podatki')
      }

      // Če je geslo shranjeno kot plain/legacy, ga posodobi na hashirano različico
      if (!profile.password_hash) {
        await mysqlAPI.update('profiles', { password_hash: hashedPassword }, 'id = ?', [profile.id || profile.user_id])
      }

      console.log('✅ AuthContext: MySQL signIn - uporabnik uspešno prijavljen', profile.email)
      
      // Ustvari User objekt za avtentikacijo
      const authUser: AuthUser = {
        id: profile.id || profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        organization_id: profile.organization_id,
        role: profile.role || 'user'
      }
      
      // Generiraj JWT token
      const { token } = MySQLAuth.generateToken(authUser)
      
      // Shrani session
      MySQLAuth.saveSession(token, authUser)
      
      // Log successful sign in
      await logAuditAction({
        action: AuditActionTypes.USER_SIGN_IN,
        userId: authUser.id,
        details: { email: authUser.email }
      })

      setUser(authUser)
    } catch (error: any) {
      console.error('❌ AuthContext: MySQL signIn - napaka', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    console.log('📝 AuthContext: MySQL signUp - ustvarjam nov račun', normalizedEmail)
    setLoading(true)

    try {
      // Preveri, če uporabnik že obstaja
      const { data: existingProfiles } = await mysqlAPI.select('profiles', '*', 'email = ?', [normalizedEmail])
      
      if (existingProfiles && existingProfiles.length > 0) {
        throw new Error('Uporabnik s tem e-poštnim naslovom že obstaja')
      }
      
      // Ustvari nov profil
      const newProfile = {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        email: normalizedEmail,
        full_name: fullName,
        role: 'user',
        is_active: true,
        password_hash: await MySQLAuth.hashPassword(password),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await mysqlAPI.insert('profiles', newProfile)
      
      if (error) {
        throw new Error('Napaka pri ustvarjanju računa: ' + error)
      }
      
      // Samodejno se prijavi
      await signIn(email, password)
      
      console.log('✅ AuthContext: MySQL signUp - račun uspešno ustvarjen')
      
      // Log successful sign up
      await logAuditAction({
        action: AuditActionTypes.USER_SIGN_UP,
        userId: newProfile.id,
        details: { email: newProfile.email }
      })
      
    } catch (error: any) {
      console.error('❌ AuthContext: MySQL signUp - napaka', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('👋 AuthContext: MySQL signOut - odjavljam se')
    
    try {
      if (user) {
        // Log sign out
        await logAuditAction({
          action: AuditActionTypes.USER_SIGN_OUT,
          userId: user.id,
          details: { email: user.email }
        })
      }
      
      // Clear session
      MySQLAuth.clearSession()
      setUser(null)
      
      console.log('✅ AuthContext: MySQL signOut - uspešno odjavljen')
    } catch (error: any) {
      console.error('❌ AuthContext: MySQL signOut - napaka', error)
      // Still clear session even if logging fails
      MySQLAuth.clearSession()
      setUser(null)
    }
  }

  // Organization switching (mock implementation)
  const switchOrganization = async (organizationId: string) => {
    console.log('🏢 AuthContext: MySQL switchOrganization - spreminjam organizacijo', organizationId)
    
    if (!user) {
      throw new Error('Uporabnik ni prijavljen')
    }
    
    try {
      // Mock implementation - v produkciji bi posodobili profil
      const updatedUser = { ...user, organization_id: parseInt(organizationId) }
      setUser(updatedUser)
      
      // Shrani v session
      const { token } = MySQLAuth.getSession()
      if (token) {
        MySQLAuth.saveSession(token, updatedUser)
      }
      
      console.log('✅ AuthContext: MySQL organization switched')
    } catch (error: any) {
      console.error('❌ AuthContext: MySQL switchOrganization - napaka', error)
      throw error
    }
  }

  // Get available organizations (mock implementation)
  const getAvailableOrganizations = async () => {
    console.log('📋 AuthContext: MySQL getAvailableOrganizations')
    
    try {
      const { data: organizations, error } = await mysqlAPI.select('organizations', 'id, name')
      
      if (error) {
        console.error('Error fetching organizations:', error)
        return []
      }
      
      return organizations?.map((org: any) => ({
        id: org.id.toString(),
        name: org.name,
        role: 'member'
      })) || []
    } catch (error: any) {
      console.error('❌ AuthContext: MySQL getAvailableOrganizations - napaka', error)
      return []
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    switchOrganization,
    getAvailableOrganizations
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
