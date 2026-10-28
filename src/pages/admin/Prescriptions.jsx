import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pill,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { prescriptionsService } from '../../services/prescriptionsService.js'
import PrescriptionDetailsModal from '../../components/prescriptions/PrescriptionDetailsModal.jsx'
import CreatePrescriptionModal from '../../components/prescriptions/CreatePrescriptionModal.jsx'
import EditPrescriptionModal from '../../components/prescriptions/EditPrescriptionModal.jsx'

export default function Prescriptions() {
  const navigate = useNavigate()

  // Data states
  const [stats, setStats] = useState({
    total_prescriptions: 0,
    created_this_month: 0,
    active_prescriptions: 0,
    discontinued_or_cancelled: 0,
    completed_prescriptions: 0,
  })
  const [prescriptions, setPrescriptions] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  })

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  // UI state
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Modals state
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const data = await prescriptionsService.getStats()
      setStats(data)
    } catch (err) {
      console.warn('Failed to load prescription stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchPrescriptions = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page,
        per_page: pagination.per_page,
        q: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sortDir,
      }
      const data = await prescriptionsService.getPrescriptions(params)
      setPrescriptions(data.prescriptions || [])
      setPagination({
        page: data.page,
        per_page: data.per_page,
        total: data.total,
        total_pages: data.total_pages,
      })
    } catch (err) {
      console.error('Failed to load prescriptions:', err)
      setError(err.response?.data?.error || 'Failed to load prescriptions from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchPrescriptions(1)
  }, [statusFilter, sortDir])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchPrescriptions(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setStartDate('')
    setEndDate('')
    setSortDir('desc')
    setTimeout(() => fetchPrescriptions(1), 50)
  }

  const handleOpenDetails = async (rx) => {
    try {
      const full = await prescriptionsService.getPrescriptionById(rx.id)
      setSelectedPrescription(full)
    } catch (err) {
      setSelectedPrescription(rx)
    }
  }

  const handleQuickStatusChange = async (rx, newStatus) => {
    try {
      await prescriptionsService.updatePrescription(rx.id, { status: newStatus })
      showToast(`Prescription #${rx.id} status updated to ${newStatus}`)
      fetchPrescriptions(pagination.page)
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status', 'danger')
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || 'Active').toLowerCase()
    if (s === 'active') {
      return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>
    }
    if (s === 'completed') {
      return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Completed</span>
    }
    if (s === 'discontinued' || s === 'cancelled' || s === 'canceled') {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">{status}</span>
    }
    return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">{status}</span>
  }

  return (
    <div className="py-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible position-fixed top-0 end-0 m-3 shadow-lg fade show z-3`}
          style={{ minWidth: '300px', zIndex: 1100 }}
          role="alert"
        >
          <div className="d-flex align-items-center gap-2">
            {toast.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="fw-bold text-dark mb-0">Prescription Management</h4>
            <span className="badge bg-teal-subtle text-teal border border-teal-subtle" style={{ color: '#0d9488', backgroundColor: '#ccfbf1' }}>
              Digital Pharmacy E-Rx
            </span>
          </div>
          <p className="text-muted small mb-0">
            Monitor, audit, and issue clinical medication orders, active dispensing therapies, and patient drug regimens.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 bg-white"
            onClick={() => {
              fetchPrescriptions(pagination.page)
              fetchStats()
            }}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={16} />
            <span>Issue New Prescription</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Orders</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">
                  {statsLoading ? '...' : stats.total_prescriptions}
                </h3>
                <small className="text-muted">Issued across all clinics</small>
              </div>
              <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                <Pill size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Created This Month</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">
                  {statsLoading ? '...' : stats.created_this_month}
                </h3>
                <small className="text-muted">Current billing period</small>
              </div>
              <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Active Regimens</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">
                  {statsLoading ? '...' : stats.active_prescriptions}
                </h3>
                <small className="text-muted">Currently being dispensed</small>
              </div>
              <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Discontinued / Cancelled</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">
                  {statsLoading ? '...' : stats.discontinued_or_cancelled}
                </h3>
                <small className="text-muted">Halted or rescinded</small>
              </div>
              <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search patient, doctor, Rx #, medication..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control form-control-sm bg-light"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control form-control-sm bg-light"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>

          {/* Actions */}
          <div className="col-6 col-md-2 d-flex gap-2 justify-content-end">
            <button type="submit" className="btn btn-primary btn-sm flex-grow-1">
              Filter
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Prescription Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        {error ? (
          <div className="p-5 text-center text-danger">
            <AlertCircle size={36} className="mb-2" />
            <h6 className="fw-bold">Unable to load prescriptions</h6>
            <p className="text-muted small">{error}</p>
            <button
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={() => fetchPrescriptions(pagination.page)}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
            <p className="small mb-0">Querying medication records from PostgreSQL database...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <Pill size={40} className="text-muted mb-2 opacity-50" />
            <h6 className="fw-semibold text-dark">No Prescriptions Found</h6>
            <p className="small text-muted mb-3">
              {search || statusFilter !== 'ALL' || startDate || endDate
                ? 'No medication records match your search and filter criteria.'
                : 'No prescription records are registered in the system yet.'}
            </p>
            {search || statusFilter !== 'ALL' || startDate || endDate ? (
              <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
                Clear Filters
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusCircle size={15} />
                <span>Issue First Prescription</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light" style={{ fontSize: '0.78rem' }}>
                <tr>
                  <th className="ps-4">Rx ID</th>
                  <th>Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Medication Order</th>
                  <th>Duration / Route</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.84rem' }}>
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-1">
                        <span className="fw-bold text-dark">#{rx.id}</span>
                        {rx.amendment_count > 0 && (
                          <span
                            className="badge bg-warning text-dark ms-1"
                            style={{ fontSize: '0.62rem' }}
                            title={`${rx.amendment_count} clinical amendment(s)`}
                          >
                            Amended
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div>
                        <strong className="text-dark d-block">{rx.patient_name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          ID: #{rx.patient_id} • {rx.patient_gender}, {rx.patient_age} yrs
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="text-dark fw-medium d-block">{rx.doctor_name}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {rx.doctor_specialization || 'Clinical Care'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <strong className="text-primary">{rx.medication_name}</strong>
                        <span className="badge bg-light text-dark border ms-1">{rx.dosage}</span>
                        <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                          {rx.frequency}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="text-dark">{rx.duration}</span>
                        <span className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                          {rx.route || 'Oral'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="text-dark">{rx.prescription_date}</span>
                    </td>

                    <td>{getStatusBadge(rx.status)}</td>

                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm p-1 px-2"
                          onClick={() => handleOpenDetails(rx)}
                          title="View Complete Prescription Details"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm p-1 px-2"
                          onClick={() => setEditingPrescription(rx)}
                          title="Edit Details / Update Status"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.total > 0 && (
          <div className="p-3 bg-light border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
            <span className="text-muted small">
              Showing {(pagination.page - 1) * pagination.per_page + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
              <strong>{pagination.total}</strong> prescriptions
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm p-1 px-2"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchPrescriptions(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="small px-2 text-dark fw-medium">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm p-1 px-2"
                disabled={pagination.page >= pagination.total_pages || loading}
                onClick={() => fetchPrescriptions(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPrescription && (
        <PrescriptionDetailsModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onEdit={(rx) => {
            setSelectedPrescription(null)
            setEditingPrescription(rx)
          }}
          onViewMedicalRecord={(emrId) => {
            setSelectedPrescription(null)
            navigate('/admin/medical-records')
          }}
        />
      )}

      {showCreateModal && (
        <CreatePrescriptionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            showToast('New prescription order issued successfully!')
            fetchPrescriptions(1)
            fetchStats()
          }}
        />
      )}

      {editingPrescription && (
        <EditPrescriptionModal
          prescription={editingPrescription}
          onClose={() => setEditingPrescription(null)}
          onSuccess={() => {
            showToast('Prescription order updated successfully!')
            fetchPrescriptions(pagination.page)
            fetchStats()
          }}
        />
      )}
    </div>
  )
}
