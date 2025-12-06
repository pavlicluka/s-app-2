import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { ISORiskAssessmentAddModal, ModifyModal } from '../modals'
import { useOrganizationId } from '../../hooks/useOrganizationId'

export default function ISORiskAssessment() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { organizationId } = useOrganizationId()
  
  // Check for demo mode
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Demo data for ISO Risk Assessment
  const demoRecords = [
    {
      id: 1,
      risk_id: 'RISK-001',
      asset_name: 'Strežnik za podatke strank',
      threat_description: 'Neavtoriziran dostop do strežnika',
      vulnerability_description: 'Slaba konfiguracija varnostnih nastavitev',
      likelihood: 'high',
      impact: 'high',
      risk_level: 'high',
      mitigation_strategy: 'Okrepitev varnostnih nastavitev in redni pregledi',
      residual_risk: 'medium',
      owner: 'Janez Novak',
      review_date: '2024-03-15',
      organization_id: organizationId,
      status: 'in_progress',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      risk_id: 'RISK-002',
      asset_name: 'Mobilne aplikacije',
      threat_description: 'Malware v mobilnih aplikacijah',
      vulnerability_description: 'Pomanjkanje antivirusne zaščite',
      likelihood: 'medium',
      impact: 'medium',
      risk_level: 'medium',
      mitigation_strategy: 'Namestitev MDM rešitve in izobraževanje uporabnikov',
      residual_risk: 'low',
      owner: 'Ana Kovač',
      review_date: '2024-04-01',
      organization_id: organizationId,
      status: 'identified',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T11:45:00Z'
    },
    {
      id: 3,
      risk_id: 'RISK-003',
      asset_name: 'Podatkovna baza',
      threat_description: 'Izguba podatkov zaradi okvare strojne opreme',
      vulnerability_description: 'Ni rednih varnostnih kopij',
      likelihood: 'low',
      impact: 'critical',
      risk_level: 'high',
      mitigation_strategy: 'Implementacija avtomatskih varnostnih kopij in redundantnosti',
      residual_risk: 'low',
      owner: 'Marko Žagar',
      review_date: '2024-02-28',
      organization_id: organizationId,
      status: 'resolved',
      created_at: '2024-01-05T08:30:00Z',
      updated_at: '2024-01-25T16:20:00Z'
    },
    {
      id: 4,
      risk_id: 'RISK-004',
      asset_name: 'Wi-Fi omrežje',
      threat_description: 'Napad na Wi-Fi omrežje',
      vulnerability_description: 'Šibko geslo za Wi-Fi',
      likelihood: 'medium',
      impact: 'high',
      risk_level: 'medium',
      mitigation_strategy: 'Okrepitev Wi-Fi gesel in implementacija WPA3',
      residual_risk: 'low',
      owner: 'Petra Horvat',
      review_date: '2024-03-20',
      organization_id: organizationId,
      status: 'in_progress',
      created_at: '2024-01-12T12:00:00Z',
      updated_at: '2024-01-22T10:15:00Z'
    },
    {
      id: 5,
      risk_id: 'RISK-005',
      asset_name: 'Elektronska pošta',
      threat_description: 'Phishing napadi prek e-pošte',
      vulnerability_description: 'Pomanjkanje usposabljanja zaposlenih',
      likelihood: 'very_high',
      impact: 'medium',
      risk_level: 'high',
      mitigation_strategy: 'Redno usposabljanje zaposlenih in filtriranje e-pošte',
      residual_risk: 'medium',
      owner: 'Tomaž Krek',
      review_date: '2024-04-15',
      organization_id: organizationId,
      status: 'identified',
      created_at: '2024-01-08T14:45:00Z',
      updated_at: '2024-01-16T09:30:00Z'
    }
  ]

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  const fetchRecords = async () => {
    // In demo mode, show empty state without trying to fetch from database
    if (isDemoMode || !organizationId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data, error} = await supabase
        .from('iso_risk_assessment')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // If no real records, show demo data
      if (!data || data.length === 0) {
        setRecords(demoRecords)
      } else {
        setRecords(data)
      }
    } catch (error) {
      console.error('Error:', error)
      // On error, show demo data
      setRecords(demoRecords)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    fetchRecords()
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsViewModalOpen(false)
    setSelectedRecord(null)
  }

  const openEditModal = (record: any) => {
    setSelectedRecord(record)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (record: any) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = (record: any) => {
    setSelectedRecord(record)
    setIsViewModalOpen(true)
  }

  useEffect(() => {
    fetchRecords()
  }, [organizationId, isDemoMode])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        <p className="text-body-sm text-text-secondary">{t('common.loading')}</p>
      </div>
    </div>
  )

  if (!isDemoMode && !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <h3 className="text-heading-md font-semibold text-text-primary mb-2">
            {t('common.organizationRequired')}
          </h3>
          <p className="text-body text-text-secondary">
            {t('common.organizationRequiredDescription')}
          </p>
        </div>
      </div>
    )
  }

  const getRiskStyle = (risk: string) => {
    switch(risk.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-green-500 bg-green-500/10'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-high/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-risk-high" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('iso.risk.title')}</h1>
            <p className="text-body-sm text-text-secondary">{t('iso.risk.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-body-sm font-medium">{t('iso.risk.addRisk')}</span>
        </button>
      </div>

      <div className="bg-bg-surface rounded-sm border border-border-subtle overflow-hidden">
        {records.length > 0 ? (
          <table className="w-full">
            <thead className="bg-bg-pure-black border-b border-border-subtle">
              <tr>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskId')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.assetName')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.threatDescription')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.likelihood')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.impact')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.riskLevel')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.status')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('iso.risk.owner')}</th>
                <th className="text-left px-6 py-4 text-caption text-text-secondary uppercase tracking-wide">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-bg-surface-hover transition-colors duration-150">
                  <td className="px-6 py-4 text-body text-text-primary font-mono">{record.risk_id}</td>
                  <td className="px-6 py-4 text-body text-text-primary font-medium">{record.asset_name}</td>
                  <td className="px-6 py-4 text-body text-text-secondary max-w-xs truncate">{record.threat_description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.likelihood)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.likelihood.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.impact)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.impact.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getRiskStyle(record.risk_level)}`}>
                      {t(`iso.risk.riskLevelOptions.${record.risk_level.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-caption font-medium bg-blue-500/10 text-blue-500">
                      {record.status === 'identified' ? 'Identificirano' : 
                       record.status === 'in_progress' ? 'V obravnavi' : 
                       record.status === 'resolved' ? 'Rešeno' : record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-text-secondary">{record.owner}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openViewModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.view')}
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openEditModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(record)}
                        className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-status-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-heading-md font-semibold text-text-primary mb-2">
              {t('iso.risk.noRisks')}
            </h3>
            <p className="text-body text-text-secondary">
              Začnite z dodajanjem prvega tveganja z klikom na gumb "Dodaj tveganje".
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-body-sm text-blue-400">
                <strong>Opomba:</strong> Prikazani so primeri demo podatkov. Da bi dodali lastne zapise, 
                kliknite na "Dodaj tveganje" in izpolnite obrazec.
              </p>
            </div>
          </div>
        )}
      </div>

      <ISORiskAssessmentAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSuccess}
      />

      <ModifyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="edit"
        record={selectedRecord}
        title="Uredi oceno tveganja"
        table="iso_risk_assessment"
        fields={[
          { key: 'risk_id', label: 'ID tveganja', type: 'text' as const, required: true },
          { key: 'asset_name', label: 'Naziv sredstva', type: 'text' as const, required: true },
          { key: 'threat_description', label: 'Opis grožnje', type: 'textarea' as const, required: true },
          { key: 'vulnerability_description', label: 'Opis ranljivosti', type: 'textarea' as const },
          { key: 'likelihood', label: 'Verjetnost', type: 'select' as const, required: true, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'impact', label: 'Vpliv', type: 'select' as const, required: true, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'risk_level', label: 'Nivo tveganja', type: 'select' as const, required: true, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'mitigation_strategy', label: 'Strategija za zmanjšanje', type: 'textarea' as const },
          { key: 'residual_risk', label: 'Preostalo tveganje', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'owner', label: 'Lastnik', type: 'text' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />

      <ModifyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="delete"
        record={selectedRecord}
        title="Izbriši oceno tveganja"
        table="iso_risk_assessment"
        fields={[]}
        defaultValues={{}}
      />

      <ModifyModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={handleModalSuccess}
        mode="view"
        record={selectedRecord}
        title="Podrobnosti ocene tveganja"
        table="iso_risk_assessment"
        fields={[
          { key: 'risk_id', label: 'ID tveganja', type: 'text' as const },
          { key: 'asset_name', label: 'Naziv sredstva', type: 'text' as const },
          { key: 'threat_description', label: 'Opis grožnje', type: 'textarea' as const },
          { key: 'vulnerability_description', label: 'Opis ranljivosti', type: 'textarea' as const },
          { key: 'likelihood', label: 'Verjetnost', type: 'select' as const, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'impact', label: 'Vpliv', type: 'select' as const, options: [
            'very_low',
            'low',
            'medium',
            'high',
            'very_high'
          ]},
          { key: 'risk_level', label: 'Nivo tveganja', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'mitigation_strategy', label: 'Strategija za zmanjšanje', type: 'textarea' as const },
          { key: 'residual_risk', label: 'Preostalo tveganje', type: 'select' as const, options: [
            'low',
            'medium',
            'high',
            'critical'
          ]},
          { key: 'owner', label: 'Lastnik', type: 'text' as const },
          { key: 'review_date', label: 'Datum pregleda', type: 'date' as const }
        ]}
        defaultValues={{ organization_id: organizationId }}
      />
    </div>
  )
}
