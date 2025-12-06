import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'

const isoComplianceTrackingFields = [
  { key: 'control_id', label: 'ID kontrole', type: 'text' as const, required: true },
  { key: 'control_name', label: 'Naziv kontrole', type: 'text' as const, required: true },
  { key: 'control_category', label: 'Kategorija kontrole', type: 'text' as const },
  { key: 'compliance_status', label: 'Status skladnosti', type: 'select' as const, options: [
    'compliant',
    'partially_compliant', 
    'non_compliant',
    'under_review',
    'not_applicable'
  ]},
  { key: 'last_audit_date', label: 'Datum zadnjega pregleda', type: 'date' as const },
  { key: 'next_audit_date', label: 'Datum naslednjega pregleda', type: 'date' as const },
  { key: 'audit_frequency', label: 'Frekvenca pregledov', type: 'text' as const },
  { key: 'responsible_person', label: 'Odgovorna oseba', type: 'text' as const },
  { key: 'evidence_location', label: 'Lokacija dokazil', type: 'textarea' as const },
  { key: 'findings', label: 'Ugotovitve', type: 'textarea' as const },
  { key: 'action_items', label: 'Aktivnosti', type: 'textarea' as const }
]

interface ISOComplianceTrackingAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOComplianceTrackingAddModal({ isOpen, onClose, onSave }: ISOComplianceTrackingAddModalProps) {
  const { organizationId } = useOrganizationId()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title="Dodaj novo skladnost"
      table="iso_compliance_tracking"
      fields={[
        ...isoComplianceTrackingFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}