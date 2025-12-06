import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoIncidentResponseFields = [
  { key: 'incident_id', label: 'ID incidenta', type: 'text' as const, required: true },
  { key: 'incident_title', label: 'Naslov incidenta', type: 'text' as const, required: true },
  { key: 'incident_type', label: 'Tip incidenta', type: 'select' as const, required: true, options: [
    'malware',
    'phishing',
    'data_breach',
    'unauthorized_access',
    'ddos',
    'social_engineering',
    'insider_threat',
    'physical_security',
    'system_failure',
    'other'
  ]},
  { key: 'detection_date', label: 'Datum zaznave', type: 'datetime' as const, required: true },
  { key: 'response_date', label: 'Datum odziva', type: 'datetime' as const },
  { key: 'resolution_date', label: 'Datum rešitve', type: 'datetime' as const },
  { key: 'severity', label: 'Resnost', type: 'select' as const, required: true, options: [
    'low',
    'medium',
    'high',
    'critical'
  ]},
  { key: 'impact_description', label: 'Opis vpliva', type: 'textarea' as const, required: true },
  { key: 'affected_systems', label: 'Prizadeti sistemi', type: 'textarea' as const },
  { key: 'root_cause', label: 'Korenski vzrok', type: 'textarea' as const },
  { key: 'corrective_actions', label: 'Popravni ukrepi', type: 'textarea' as const },
  { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'open',
    'investigating',
    'contained',
    'resolved',
    'closed'
  ]}
]

interface ISOIncidentResponseAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOIncidentResponseAddModal({ isOpen, onClose, onSave }: ISOIncidentResponseAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj nov incident"
      table="iso_incident_response"
      fields={[
        ...isoIncidentResponseFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}