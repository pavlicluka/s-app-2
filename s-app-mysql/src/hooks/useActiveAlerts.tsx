import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { mysqlAPI } from '../lib/mysql-client'
import { useAuth } from '../contexts/AuthContext'

// Interfaces
interface Prijava {
  id: string
  stevilo_prijave: string
  kratek_opis: string
  podrocje: string
  status: string
  datum_potrditev?: string
  datum_resitve?: string
  created_at: string
  updated_at: string
}

interface GDPRZahtevek {
  id: string
  request_id: string
  subject_name: string
  subject_email: string
  request_date: string
  request_type: string
  status: string
  response_deadline: string
  legal_basis_description: string
  data_categories: string[]
  data_description: string
  created_at: string
  updated_at: string
}

export function useActiveAlerts() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<any[]>([])
  const [prijave, setPrijave] = useState<Prijava[]>([])
  const [gdprZahtevki, setGdprZahtevki] = useState<GDPRZahtevki[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'
  console.log('🔍 useActiveAlerts: Demo mode:', isDemoMode, 'User:', user?.id || 'null')

  // Demo data za stari NIS 2 incidenti
  const demoStariIncidenti = [
    {
      id: '1',
      incident_id: 'INC-2024-001',
      type: 'Ransomware napad',
      detected_at: '2024-11-01T10:30:00Z',
      description: 'Ransomware je prizadel datotečni strežnik',
      estimated_damage: 'Visoko',
      severity: 'kritično',
      status: 'investigating',
      organization_id: 'demo-org',
      created_at: '2024-11-01T10:30:00Z',
      updated_at: '2024-11-01T10:30:00Z'
    },
    {
      id: '2',
      incident_id: 'INC-2024-002',
      type: 'Phishing e-pošta',
      detected_at: '2024-11-02T14:20:00Z',
      description: 'Zaposleni je prejel sumljivo e-poštno sporočilo',
      estimated_damage: 'Srednje',
      severity: 'srednje',
      status: 'active',
      organization_id: 'demo-org',
      created_at: '2024-11-02T14:20:00Z',
      updated_at: '2024-11-02T14:20:00Z'
    },
    {
      id: '3',
      incident_id: 'INC-2024-003',
      type: 'DDoS napad',
      detected_at: '2024-11-20T08:15:00Z',
      description: 'Napad na spletno stran z masovnimi zahtevki',
      estimated_damage: 'Visoko',
      severity: 'visoko',
      status: 'active',
      organization_id: 'demo-org',
      created_at: '2024-11-20T08:15:00Z',
      updated_at: '2024-11-20T08:15:00Z'
    },
    {
      id: '4',
      incident_id: 'INC-2024-004',
      type: 'Neavtoriziran dostop',
      detected_at: '2024-11-21T14:45:00Z',
      description: 'Zaznan neavtoriziran poskus dostopa do sistema',
      estimated_damage: 'Nizko',
      severity: 'nizko',
      status: 'investigating',
      organization_id: 'demo-org',
      created_at: '2024-11-21T14:45:00Z',
      updated_at: '2024-11-21T14:45:00Z'
    }
  ]

  // Demo data za ZZPri prijave
  const demoPrijave = [
    {
      id: '1',
      stevilo_prijave: 'ZZPri-2024-001',
      kratek_opis: 'Sum korupcije v javnem naročanju',
      podrocje: 'korupcija',
      status: 'prejeta',
      datum_potrditev: '2024-11-20T10:00:00Z',
      datum_resitve: '2024-12-01T10:00:00Z',
      created_at: '2024-11-01T10:30:00Z',
      updated_at: '2024-11-01T10:30:00Z'
    },
    {
      id: '2',
      stevilo_prijave: 'ZZPri-2024-002',
      kratek_opis: 'Nepravilnosti pri javni upravi',
      podrocje: 'nepravilnosti',
      status: 'prejeta',
      datum_potrditev: '2024-11-25T10:00:00Z',
      datum_resitve: '2024-12-05T10:00:00Z',
      created_at: '2024-11-02T14:20:00Z',
      updated_at: '2024-11-02T14:20:00Z'
    }
  ]

  // Demo data za GDPR zahtevke
  const demoGdprZahtevki = [
    {
      id: '1',
      request_id: 'GDPR-2024-001',
      subject_name: 'Janez Novak',
      subject_email: 'janez.novak@example.com',
      request_date: '2024-10-20T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'received',
      response_deadline: '2024-10-25T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['contact_information', 'purchase_history'],
      data_description: 'Kontaktni podatki in zgodovina nakupov',
      created_at: '2024-10-20T10:00:00Z',
      updated_at: '2024-10-20T10:00:00Z'
    },
    {
      id: '2',
      request_id: 'GDPR-2024-002',
      subject_name: 'Ana Kovač',
      subject_email: 'ana.kovac@example.com',
      request_date: '2024-10-15T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'processing',
      response_deadline: '2024-10-20T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['personal_profile'],
      data_description: 'Osebni profil in nastavitve',
      created_at: '2024-10-15T10:00:00Z',
      updated_at: '2024-10-15T10:00:00Z'
    },
    {
      id: '3',
      request_id: 'GDPR-2024-003',
      subject_name: 'Marko Pretnar',
      subject_email: 'marko.pretnar@example.com',
      request_date: '2024-10-10T10:00:00Z',
      request_type: 'Right to be forgotten',
      status: 'received',
      response_deadline: '2024-10-15T23:59:59Z',
      legal_basis_description: 'GDPR Article 17 - Right to erasure',
      data_categories: ['contact_information'],
      data_description: 'Kontaktni podatki',
      created_at: '2024-10-10T10:00:00Z',
      updated_at: '2024-10-10T10:00:00Z'
    }
  ]

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || isDemoMode) {
        console.log('🔄 useActiveAlerts: Demo mode or no user - using demo data')
        setUserProfile({ organization_id: null })
        setLoading(false)
        return
      }
      
      try {
        const { data: profiles, error } = await mysqlAPI.select('profiles', '*', 'id = ?', [user.id])
        
        if (error) throw error
        if (profiles && profiles.length > 0) {
          setUserProfile(profiles[0])
        } else {
          setUserProfile({ organization_id: null })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setUserProfile({ organization_id: null })
      }
    }

    fetchUserProfile()
  }, [user])

  // Load data function - preverja podatke iz MySQL ali uporabi demo podatke
  async function loadAlertsData() {
    if (!userProfile?.organization_id) {
      // Uporabi demo podatke
      setIncidents(demoStariIncidenti)
      setPrijave(demoPrijave)
      setGdprZahtevki(demoGdprZahtevki)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load vsi podatki paralelno iz MySQL
      const [incidentsResult, prijaveResult, gdprResult] = await Promise.all([
        mysqlAPI.select('incidents', '*', 'organization_id = ?', [userProfile.organization_id]),
        mysqlAPI.select('prijave', '*', 'organization_id = ?', [userProfile.organization_id]),
        mysqlAPI.select('gdpr_right_forgotten', '*', 'organization_id = ?', [userProfile.organization_id])
      ])

      setIncidents(incidentsResult.data || [])
      setPrijave(prijaveResult.data || [])
      setGdprZahtevki(gdprResult.data || [])
    } catch (error) {
      console.error('Error loading alerts data:', error)
      // Če je napaka, uporabi demo podatke
      setIncidents(demoStariIncidenti)
      setPrijave(demoPrijave)
      setGdprZahtevki(demoGdprZahtevki)
    } finally {
      setLoading(false)
    }
  }

  // Load data when user profile changes
  useEffect(() => {
    console.log('🔄 useActiveAlerts: MySQL - organization or profile changed, reloading data')
    // Load data immediately when user profile changes
    loadAlertsData()
  }, [userProfile])

  // Utility functions
  function getDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function getDaysSinceDetection(detectedAt: string): number {
    const detectedDate = new Date(detectedAt)
    const now = new Date()
    const diffTime = now.getTime() - detectedDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // Computed values - enaka logika kot v AlertsPage.tsx
  const stariIncidenti = incidents.filter(incident => {
    const daysSinceDetection = getDaysSinceDetection(incident.detected_at)
    const isOldIncident = daysSinceDetection > 1
    const isNotResolved = incident.status !== 'resolved'
    return isOldIncident && isNotResolved
  })

  const kratkiRokiPrijave = prijave.filter(prijava => {
    let hasShortDeadline = false

    // Preveri rok potrditve
    if (prijava.datum_potrditev) {
      const daysToConfirmation = getDaysUntilDeadline(prijava.datum_potrditev)
      if (daysToConfirmation >= 0 && daysToConfirmation < 3) {
        hasShortDeadline = true
      }
    }

    // Preveri rok rešitve
    if (prijava.datum_resitve) {
      const daysToResolution = getDaysUntilDeadline(prijava.datum_resitve)
      if (daysToResolution >= 0 && daysToResolution < 3) {
        hasShortDeadline = true
      }
    }

    // Preveri, da ni rešena
    const isNotResolved = prijava.status !== 'rešena'
    return hasShortDeadline && isNotResolved
  })

  const potekliGdprZahtevki = gdprZahtevki.filter(zahtevek => {
    // Preveri, da ni completed/executed
    if (zahtevek.status === 'completed' || zahtevek.status === 'executed') {
      return false
    }

    // Preveri, da je rok potekel
    if (zahtevek.response_deadline) {
      const daysToDeadline = getDaysUntilDeadline(zahtevek.response_deadline)
      return daysToDeadline < 0 // Pozitivno, če je rok potekel
    }

    return false
  })

  // Skupno število aktivnih opozoril
  const totalActiveAlerts = stariIncidenti.length + kratkiRokiPrijave.length + potekliGdprZahtevki.length

  // Bool vrednost - ali obstajajo aktivna opozorila
  const hasActiveAlerts = totalActiveAlerts > 0

  // Sporočila
  const noAlertsMessage = "Trenutno ni aktivnih opozoril"
  const activeAlertsMessage = "POZOR! Obstajajo opozorila - oglejte si jih!"

  return {
    // Data
    incidents,
    prijave,
    gdprZahtevki,
    loading,
    
    // Filtered data
    stariIncidenti,
    kratkiRokiPrijave,
    potekliGdprZahtevki,
    
    // Results
    hasActiveAlerts,
    totalActiveAlerts,
    noAlertsMessage,
    activeAlertsMessage,
    
    // Functions
    refreshData: loadAlertsData
  }
}