import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useOrganization } from '../../hooks/useOrganization'
import { 
  Shield, Plus, FileText, Download, Filter, 
  Grid, List, BarChart3, Eye, Clock, AlertCircle, CheckCircle,
  ArrowUpDown, Scale, UserCheck, AlertTriangle,
  Calendar, TrendingUp, FileCheck, Users, Trash2
} from 'lucide-react'

type ViewType = 'full' | 'basic' | 'catalog' | 'statistics'

interface ComplianceEvidence {
  id: string
  organization_id: string
  noncompliance_id: string
  violation_title: string
  violation_description: string
  violation_type: string
  severity_level: string
  regulatory_framework: string
  detection_date: string
  notification_date?: string
  notification_required?: boolean
  resolution_date?: string
  recurring_violation?: boolean
  affected_area?: string
  corrective_actions?: string
  preventive_measures?: string
  root_cause?: string
  oversight_authority?: string
  responsible_person?: string
  investigation_lead?: string
  financial_impact?: number
  compliance_score?: number
  compliance_status?: string
  status?: string
  lessons_learned?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

export default function GDPRComplianceEvidence() {
  const { t } = useTranslation()
  const { organizationId, userProfile, loading: orgLoading, error: orgError } = useOrganization()
  const [records, setRecords] = useState<ComplianceEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('full')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<ComplianceEvidence | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('compliance_evidence')
        .select('*')
        .eq('organization_id', organizationId)
        .order('detection_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchRecords()
    }
  }, [organizationId])

  // Filtered and sorted records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesSearch = !searchTerm || 
        record.violation_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.violation_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.noncompliance_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSeverity = selectedSeverity === 'all' || record.severity_level === selectedSeverity
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
      const matchesFramework = selectedFramework === 'all' || record.regulatory_framework === selectedFramework

      // Date range filter
      let matchesDateRange = true
      if (selectedDateRange !== 'all') {
        const detectionDate = new Date(record.detection_date)
        const now = new Date()
        
        switch (selectedDateRange) {
          case 'last30days':
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDateRange = detectionDate >= thirtyDaysAgo
            break
          case 'last90days':
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            matchesDateRange = detectionDate >= ninetyDaysAgo
            break
          case 'lastYear':
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            matchesDateRange = detectionDate >= oneYearAgo
            break
        }
      }

      return matchesSearch && matchesSeverity && matchesStatus && matchesFramework && matchesDateRange
    })

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ComplianceEvidence]
        const bValue = b[sortConfig.key as keyof ComplianceEvidence]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        return 0
      })
    }

    return filtered
  }, [records, searchTerm, selectedSeverity, selectedStatus, selectedFramework, selectedDateRange, sortConfig])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'in_progress': return 'text-blue-600 bg-blue-50'
      case 'open': return 'text-red-600 bg-red-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleAddNew = () => {
    setSelectedEvidence(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (evidence: ComplianceEvidence) => {
    setSelectedEvidence(evidence)
    setIsFormModalOpen(true)
  }

  const handleView = (evidence: ComplianceEvidence) => {
    setSelectedEvidence(evidence)
    setIsDetailModalOpen(true)
  }

  const handleDelete = async (evidence: ComplianceEvidence) => {
    if (!confirm(`Ali ste prepričani, da želite izbrisati evidence "${evidence.violation_title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('compliance_evidence')
        .delete()
        .eq('id', evidence.id)

      if (error) throw error
      
      setRecords(records.filter(r => r.id !== evidence.id))
    } catch (error: any) {
      console.error('Error deleting evidence:', error)
      alert('Napaka pri brisanju evidence: ' + error.message)
    }
  }

  // Statistics for dashboard view
  const statistics = useMemo(() => {
    const total = records.length
    const resolved = records.filter(r => r.status === 'resolved').length
    const critical = records.filter(r => r.severity_level === 'critical').length
    const high = records.filter(r => r.severity_level === 'high').length
    const avgComplianceScore = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / records.length 
      : 0

    return {
      total,
      resolved,
      open: total - resolved,
      critical,
      high,
      avgComplianceScore: Math.round(avgComplianceScore * 10) / 10
    }
  }, [records])

  if (orgLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (orgError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Napaka pri nalaganju organizacije</h3>
            <div className="mt-2 text-sm text-red-700">{orgError}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            {t('complianceEvidence.title', 'Evidence skladnosti')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('complianceEvidence.subtitle', 'Upravljanje evidence skladnosti z GDPR in drugimi predpisi')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView(currentView === 'full' ? 'statistics' : 'full')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {currentView === 'full' ? 'Statistika' : 'Celoten pogled'}
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add', 'Dodaj')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            
            <input
              type="text"
              placeholder={t('common.search', 'Iskanje...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">{t('common.allSeverities', 'Vse resnosti')}</option>
            <option value="critical">{t('severity.critical', 'Kritična')}</option>
            <option value="high">{t('severity.high', 'Visoka')}</option>
            <option value="medium">{t('severity.medium', 'Srednja')}</option>
            <option value="low">{t('severity.low', 'Nizka')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">{t('common.allStatuses', 'Vsi statusi')}</option>
            <option value="open">{t('status.open', 'Odprt')}</option>
            <option value="in_progress">{t('status.inProgress', 'V teku')}</option>
            <option value="resolved">{t('status.resolved', 'Rešen')}</option>
            <option value="closed">{t('status.closed', 'Zaprt')}</option>
          </select>

          {/* Framework Filter */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">{t('common.allFrameworks', 'Vsi okviri')}</option>
            <option value="GDPR">{t('framework.gdpr', 'GDPR')}</option>
            <option value="NIS2">{t('framework.nis2', 'NIS2')}</option>
            <option value="ISO27001">{t('framework.iso27001', 'ISO 27001')}</option>
            <option value="SOX">{t('framework.sox', 'SOX')}</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">{t('common.allTime', 'Ves čas')}</option>
            <option value="last30days">{t('dateRange.last30Days', 'Zadnjih 30 dni')}</option>
            <option value="last90days">{t('dateRange.last90Days', 'Zadnjih 90 dni')}</option>
            <option value="lastYear">{t('dateRange.lastYear', 'Zadnje leto')}</option>
          </select>
        </div>
      </div>

      {/* Statistics View */}
      {currentView === 'statistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('stats.total', 'Skupaj')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('stats.open', 'Odprti')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.open}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('stats.critical', 'Kritični')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.critical}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('stats.resolved', 'Rešeni')}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.resolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-8 00">Napaka pri nalaganju podatkov</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('noncompliance_id')}
                  >
                    <div className="flex items-center">
                      ID kršitve
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('violation_title')}
                  >
                    <div className="flex items-center">
                      Naslov kršitve
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('severity_level')}
                  >
                    <div className="flex items-center">
                      Resnost
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('detection_date')}
                  >
                    <div className="flex items-center">
                      Datum zaznave
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('responsible_person')}
                  >
                    <div className="flex items-center">
                      Odgovorna oseba
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRecords.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {evidence.noncompliance_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={evidence.violation_title}>
                        {evidence.violation_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(evidence.severity_level)}`}>
                        {evidence.severity_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evidence.status || '')}`}>
                        {evidence.status || 'Neznan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(evidence.detection_date).toLocaleDateString('sl-SI')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evidence.responsible_person || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(evidence)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('common.view', 'Pogled')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(evidence)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={t('common.edit', 'Uredi')}
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(evidence)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete', 'Izbriši')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAndSortedRecords.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('common.noData', 'Ni podatkov')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('complianceEvidence.noEvidence', 'Še ni dodanih evidence skladnosti.')}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('complianceEvidence.addFirst', 'Dodaj prvo evidence')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal Placeholder */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedEvidence ? t('common.edit', 'Uredi evidence') : t('common.add', 'Dodaj evidence')}
              </h3>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {t('common.comingSoon', 'Modal za dodajanje/urejanje bo implementiran v naslednji iteraciji.')}
                </p>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  {t('common.close', 'Zapri')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Placeholder */}
      {isDetailModalOpen && selectedEvidence && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('common.details', 'Podrobnosti evidence')}
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID kršitve:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.noncompliance_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Naslov kršitve:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.violation_title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opis kršitve:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.violation_description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resnost:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.severity_level}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.status || 'Neznan'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datum zaznave:</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEvidence.detection_date).toLocaleDateString('sl-SI')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Okvir predpisov:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.regulatory_framework}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Odgovorna oseba:</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvidence.responsible_person || '-'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  {t('common.close', 'Zapri')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
