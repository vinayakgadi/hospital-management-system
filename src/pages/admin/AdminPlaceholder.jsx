import { Link, useLocation } from 'react-router-dom'
import {
  FileText,
  Pill,
  BarChart3,
  Settings,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export default function AdminPlaceholder() {
  const location = useLocation()
  const path = location.pathname

  const getPageInfo = () => {
    if (path.includes('/medical-records')) {
      return {
        title: 'Electronic Medical Records (EMR)',
        category: 'Clinical Care Documentation',
        icon: FileText,
        color: '#0284c7',
        bg: '#e0f2fe',
        status: 'Under Active Development • Phase 2.1 Release',
        description:
          'Comprehensive electronic patient history, diagnostic lab test results, imaging attachments (DICOM/PDF), and clinical progress notes.',
        plannedFeatures: [
          'DICOM medical imaging & radiological scans viewer',
          'HL7/FHIR compliant health data export',
          'Lab pathology test results tracking',
          'Clinical consultation voice transcriptions',
        ],
      }
    }
    if (path.includes('/prescriptions')) {
      return {
        title: 'Digital Pharmacy & Prescriptions',
        category: 'Medication Management',
        icon: Pill,
        color: '#0d9488',
        bg: '#ccfbf1',
        status: 'Roadmap Milestone • Phase 2.2 Release',
        description:
          'Electronic prescription writing (e-Rx), drug interaction verification, automated pharmacy dispatch, and refill request authorizations.',
        plannedFeatures: [
          'Direct e-Prescribe transmission to partner pharmacies',
          'Automated drug-allergy and contraindication alerts',
          'Dosage calculation & frequency schedule tracking',
          'Patient adherence reminders via SMS & email',
        ],
      }
    }
    if (path.includes('/reports')) {
      return {
        title: 'Clinical Analytics & Compliance Reports',
        category: 'Business Intelligence',
        icon: BarChart3,
        color: '#8b5cf6',
        bg: '#ede9fe',
        status: 'Roadmap Milestone • Phase 2.3 Release',
        description:
          'Executive reporting suite providing department bed occupancy rates, physician clinical workload, patient outcome metrics, and billing analytics.',
        plannedFeatures: [
          'Automated monthly executive PDF report generator',
          'HIPAA security audit access log reports',
          'Departmental clinical load & physician throughput',
          'Diagnostic trends across geographical regions',
        ],
      }
    }
    return {
      title: 'Platform Settings & Security Policies',
      category: 'System Governance',
      icon: Settings,
      color: '#e11d48',
      bg: '#ffe4e6',
      status: 'Security Hardening • Phase 2.4 Release',
      description:
        'Global configuration options for HIPAA compliance, multi-factor authentication policies, session timeouts, and audit logging parameters.',
      plannedFeatures: [
        'Enforce Two-Factor Authentication (2FA/TOTP)',
        'Configurable idle session inactivity timeout',
        'Database automated backup & disaster recovery schedule',
        'API key and webhook credentials management',
      ],
    }
  }

  const info = getPageInfo()
  const Icon = info.icon

  return (
    <div className="py-4">
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4 p-md-5 max-w-4xl mx-auto" style={{ border: '1px solid #e2e8f0' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-4 p-3 d-inline-flex mb-3 shadow-xs"
            style={{ backgroundColor: info.bg, color: info.color }}
          >
            <Icon size={40} />
          </div>
          <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill small d-block mx-auto mb-2" style={{ width: 'fit-content' }}>
            {info.category}
          </span>
          <h2 className="h4 fw-bold text-dark mb-2">{info.title}</h2>
          <div className="d-inline-flex align-items-center gap-1 badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill small mb-3">
            <Clock size={12} />
            <span>{info.status}</span>
          </div>
          <p className="text-muted small mx-auto" style={{ maxWidth: '580px' }}>
            {info.description}
          </p>
        </div>

        {/* Planned Features Checklist */}
        <div className="p-4 rounded-3 bg-light border mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <h6 className="fw-bold text-dark mb-0 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              Planned Module Capabilities
            </h6>
          </div>
          <ul className="list-unstyled mb-0">
            {info.plannedFeatures.map((feat, idx) => (
              <li key={idx} className="d-flex align-items-center gap-2 text-secondary small mb-2">
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Back action */}
        <div className="text-center">
          <Link
            to="/admin/dashboard"
            className="btn btn-outline-primary rounded-pill px-4 btn-sm d-inline-flex align-items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Return to Admin Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
