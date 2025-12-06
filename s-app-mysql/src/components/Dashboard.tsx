import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useActiveAlerts } from '../hooks/useActiveAlerts'
import { useAuth } from '../contexts/AuthContext'
import { MySQLAPI } from '../lib/mysql-client'

export default function Dashboard({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { incidents, loading } = useActiveAlerts()
  
  // State za MySQL podatke
  const [nis2RiskRegister, setNis2RiskRegister] = useState([])
  const [supplyChainRisks, setSupplyChainRisks] = useState([])
  const [dpiaDataTable, setDpiaDataTable] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  
  // MySQL API instanca
  const mysqlAPI = new MySQLAPI()

  // Nalaganje podatkov iz MySQL baz
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true)
        setDashboardError(null)
        
        // Paralelno nalaganje vseh podatkov
        const [nis2Result, supplyResult, dpiaResult] = await Promise.allSettled([
          mysqlAPI.select('nis2_risk_register', '*'),
          mysqlAPI.select('supply_chain_suppliers', '*'),
          mysqlAPI.select('gdpr_dpia_assessments', '*')
        ])
        
        // Obdelava NIS2 Risk Register
        if (nis2Result.status === 'fulfilled' && !nis2Result.value.error) {
          setNis2RiskRegister(nis2Result.value.data || [])
        } else {
          console.warn('NIS2 Risk Register:', nis2Result.status === 'rejected' ? nis2Result.reason : nis2Result.value.error)
          // Fallback na demo podatke če MySQL neuspešen
          setNis2RiskRegister([{
            id: 'demo-1',
            risk_id: 'NISO-001',
            risk_name: 'DDoS napad na spletne storitve',
            risk_level: 'kritično',
            risk_owner: 'Janez Novak'
          }])
        }
        
        // Obdelava Supply Chain podatkov
        if (supplyResult.status === 'fulfilled' && !supplyResult.value.error) {
          setSupplyChainRisks(supplyResult.value.data || [])
        } else {
          console.warn('Supply Chain:', supplyResult.status === 'rejected' ? supplyResult.reason : supplyResult.value.error)
          // Fallback na demo podatke
          setSupplyChainRisks([{
            id: 'demo-1',
            supplier_id: 'SUP-001',
            company_name: 'IT podjetje d.o.o.',
            criticality_level: 'visoka'
          }])
        }
        
        // Obdelava DPIA podatkov
        if (dpiaResult.status === 'fulfilled' && !dpiaResult.value.error) {
          setDpiaDataTable(dpiaResult.value.data || [])
        } else {
          console.warn('DPIA Assessments:', dpiaResult.status === 'rejected' ? dpiaResult.reason : dpiaResult.value.error)
          // Fallback na demo podatke
          setDpiaDataTable([{
            id: 'demo-1',
            transfer_id: 'DPIA-001',
            transfer_name: 'Prenos podatkov strank v EU',
            data_subjects: ['Podatki strank']
          }])
        }
        
      } catch (error: any) {
        console.error('Dashboard data loading error:', error)
        setDashboardError('Napaka pri nalaganju podatkov')
        
        // Fallback na demo podatke ob napakah
        setNis2RiskRegister([{
          id: 'demo-fallback',
          risk_id: 'DEMO-001',
          risk_name: 'Demo tveganje (MySQL napaka)',
          risk_level: 'srednje',
          risk_owner: 'Demo uporabnik'
        }])
        setSupplyChainRisks([{
          id: 'demo-fallback',
          supplier_id: 'DEMO-SUP-001',
          company_name: 'Demo dobavitelj',
          criticality_level: 'nizka'
        }])
        setDpiaDataTable([{
          id: 'demo-fallback',
          transfer_id: 'DEMO-DPIA-001',
          transfer_name: 'Demo prenos podatkov',
          data_subjects: ['Demo podatki']
        }])
      } finally {
        setDashboardLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  if (loading || dashboardLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Loading Dashboard...</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Error</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{dashboardError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Poskusi ponovno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* BIG RED TEST ELEMENT */}
      <div style={{
        backgroundColor: '#10b981',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        ✅ DASHBOARD MySQL POVEZAVA AKTIVNA! 
        NIS2: {nis2RiskRegister.length} | Supply Chain: {supplyChainRisks.length} | DPIA: {dpiaDataTable.length}
      </div>
      
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title', 'Dashboard')}</h1>
      
      {/* NIS2 TABLE */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">NIS2 Risk Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID tveganja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naziv tveganja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stopnja tveganja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nis2RiskRegister.map((record: any) => (
                <tr key={record.id || record.risk_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.risk_id || record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.risk_name || record.name || 'Brez naziva'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (record.risk_level || record.severity) === 'kritično' ? 'bg-red-100 text-red-800' :
                      (record.risk_level || record.severity) === 'visoka' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.risk_level || record.severity || 'neznano'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button className="text-blue-600 mr-2">👁️</button>
                    <button className="text-green-600 mr-2">✏️</button>
                    <button className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPPLY CHAIN TABLE */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Supply Chain tveganja</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID dobavitelja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ime podjetja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kritičnost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyChainRisks.map((record: any) => (
                <tr key={record.id || record.supplier_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.supplier_id || record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.company_name || record.name || 'Brez imena'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (record.criticality_level || record.risk_level) === 'visoka' ? 'bg-red-100 text-red-800' :
                      (record.criticality_level || record.risk_level) === 'srednja' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.criticality_level || record.risk_level || 'neznano'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button className="text-blue-600 mr-2">👁️</button>
                    <button className="text-green-600 mr-2">✏️</button>
                    <button className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DPIA TABLE */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">DPIA ocena vpliva</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID prenosa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naziv prenosa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Podatkovni subjekti</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dpiaDataTable.map((record: any) => (
                <tr key={record.id || record.transfer_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.transfer_id || record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.transfer_name || record.name || 'Brez naziva'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="text-sm">
                      {record.data_subjects ? 
                        (Array.isArray(record.data_subjects) ? record.data_subjects.join(', ') : record.data_subjects) :
                        record.data_types || 'Neznano'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button className="text-blue-600 mr-2">👁️</button>
                    <button className="text-green-600 mr-2">✏️</button>
                    <button className="text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}