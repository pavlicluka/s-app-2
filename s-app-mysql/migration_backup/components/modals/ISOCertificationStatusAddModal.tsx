import AddModal from './AddModal'
import { useOrganizationId } from '../../hooks/useOrganizationId'
import { useTranslation } from 'react-i18next'

const isoCertificationStatusFields = [
  { key: 'certification_id', label: 'ID certifikacije', type: 'text' as const, required: true },
  { key: 'certification_body', label: 'Certifikacijski organ', type: 'text' as const, required: true },
  { key: 'certification_date', label: 'Datum certifikacije', type: 'date' as const, required: true },
  { key: 'expiry_date', label: 'Datum poteka', type: 'date' as const, required: true },
  { key: 'scope', label: 'Obseg certifikacije', type: 'textarea' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: [
    'active',
    'suspended',
    'expired',
    'revoked',
    'under_review'
  ]},
  { key: 'certificate_number', label: 'Številka certifikata', type: 'text' as const },
  { key: 'next_audit_date', label: 'Datum naslednje revizije', type: 'date' as const },
  { key: 'notes', label: 'Opombe', type: 'textarea' as const }
]

interface ISOCertificationStatusAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ISOCertificationStatusAddModal({ isOpen, onClose, onSave }: ISOCertificationStatusAddModalProps) {
  const { organizationId } = useOrganizationId()
  const { t } = useTranslation()
  
  return (
    <AddModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      title={t('iso.certification.addCertificate')}
      table="iso_certification_status"
      fields={[
        ...isoCertificationStatusFields,
        { key: 'organization_id', label: 'ID organizacije', type: 'text' as const, required: true }
      ]}
      defaultValues={{ organization_id: organizationId }}
    />
  )
}