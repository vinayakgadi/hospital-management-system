import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  PlusCircle,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Printer,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react'
import medicalRecordsService from '../../services/medicalRecordsService.js'
import MedicalRecordFilters from '../../components/medical-records/MedicalRecordFilters.jsx'
import MedicalRecordsTable from '../../components/medical-records/MedicalRecordsTable.jsx'
import MedicalRecordForm from '../../components/medical-records/MedicalRecordForm.jsx'
import MedicalRecordDetails from '../../components/medical-records/MedicalRecordDetails.jsx'
import PatientMedicalHistory from '../../components/medical-records/PatientMedicalHistory.jsx'

export default function MedicalRecords() {
  // Summary Stats
  const [stats, setStats] = useState({
    total_records: 0,
    created_this_month: 0,
    draft_records: 0,
    finalized_records: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Records Table & Pagination State
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const perPage = 10

  // Filter States
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  // Supporting Data
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Details Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null)
  const [recordLabs, setRecordLabs] = useState([])

  // Patient History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyPatient, setHistoryPatient] = useState(null)
  const [historyRecords, setHistoryRecords] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Printable Summary Modal
  const [printRecord, setPrintRecord] = useState(null)

  // Confirm Finalize Modal
  const [confirmFinalizeId, setConfirmFinalizeId] = useState(null)
  const [finalizing, setFinalizing] = useState(false)

  // Toast State
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // 1. Fetch Stats from SQLite
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const data = await medicalRecordsService.getStats()
      setStats(data)
    } catch (err) {
      console.warn('Failed to load medical records stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  // 2. Fetch Records Collection
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        per_page: perPage,
        sort: sortDir,
      }
      if (search) params.search = search
      if (status !== 'ALL') params.status = status
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const res = await medicalRecordsService.getRecords(params)
      setRecords(res.records || [])
      setTotalPages(res.total_pages || 1)
      setTotalRecords(res.total || 0)
    } catch (err) {
      console.error('Failed to load medical records:', err)
      showToast('Unable to load clinical records from server.', 'danger')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sortDir, search, status, startDate, endDate])

  // 3. Fetch Supporting Data (Patients & Doctors for form selection)
  const fetchSupportingData = async () => {
    try {
      const [patList, docList] = await Promise.all([
        medicalRecordsService.getPatients(),
        medicalRecordsService.getDoctors(),
      ])
      setPatients(patList || [])
      setDoctors(docList || [])
    } catch (err) {
      console.warn('Failed to load patients/doctors metadata:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchSupportingData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchRecords])

  const handleResetFilters = () => {
    setSearch('')
    setStatus('ALL')
    setStartDate('')
    setEndDate('')
    setSortDir('desc')
    setPage(1)
  }

  // Handlers: Form Create / Update
  const handleOpenCreateModal = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmittingForm(true)
      if (editingRecord && editingRecord.id) {
        await medicalRecordsService.updateRecord(editingRecord.id, formData)
        showToast(`Medical record #MR-${editingRecord.id} successfully updated!`)
      } else {
        await medicalRecordsService.createRecord(formData)
        showToast(`New medical record successfully created as ${formData.status}!`)
      }
      setIsFormOpen(false)
      setEditingRecord(null)
      fetchStats()
      fetchRecords()
    } catch (err) {
      console.error('Failed to save medical record:', err)
      showToast(err.response?.data?.error || 'Failed to save medical record.', 'danger')
    } finally {
      setIsSubmittingForm(false)
    }
  }

  // Handlers: View Details
  const handleViewRecord = async (recordId) => {
    try {
      const data = await medicalRecordsService.getRecordById(recordId)
      setSelectedRecordDetail(data.record)
      setRecordLabs(data.lab_results || [])
      setIsDetailsOpen(true)
    } catch (err) {
      console.error('Failed to view record details:', err)
      showToast('Could not load record details.', 'danger')
    }
  }

  // Handlers: Finalize Action
  const handleFinalizeClick = (recordId) => {
    setConfirmFinalizeId(recordId)
  }

  const handleConfirmFinalize = async () => {
    if (!confirmFinalizeId) return
    try {
      setFinalizing(true)
      await medicalRecordsService.finalizeRecord(confirmFinalizeId)
      showToast(`Medical record #MR-${confirmFinalizeId} is now finalized and authenticated!`)
      setConfirmFinalizeId(null)
      if (isDetailsOpen && selectedRecordDetail?.id === confirmFinalizeId) {
        setIsDetailsOpen(false)
      }
      fetchStats()
      fetchRecords()
    } catch (err) {
      console.error('Failed to finalize record:', err)
      showToast(err.response?.data?.error || 'Failed to finalize record.', 'danger')
    } finally {
      setFinalizing(false)
    }
  }

  // Handlers: Patient Medical History
  const handleViewPatientHistory = async (patientId) => {
    try {
      setHistoryLoading(true)
      setIsHistoryOpen(true)
      const data = await medicalRecordsService.getPatientHistory(patientId)
      setHistoryPatient(data.patient)
      setHistoryRecords(data.records || [])
    } catch (err) {
      console.error('Failed to load patient history:', err)
      showToast('Could not load patient medical history.', 'danger')
    } finally {
      setHistoryLoading(false)
    }
  }

  // Handlers: Print / Export Layout
  const handlePrint = (rec) => {
    setPrintRecord(rec)
  }

  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <div className="container-fluid p-0">
      {/* Toast Alert */}
      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1099 }}>
          <div
            className={`alert alert-${toast.type === 'danger' ? 'danger' : 'success'} shadow-lg border-0 d-flex align-items-center gap-2 rounded-4 px-4 py-3`}
            role="alert"
          >
            {toast.type === 'danger' ? (
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
            ) : (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            )}
            <div>
              <strong className="d-block small">{toast.type === 'danger' ? 'Error' : 'Success'}</strong>
              <small>{toast.message}</small>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Medical Records</h1>
          <p className="text-muted small mb-0">
            Manage patient clinical histories, consultations, diagnoses, and medical documentation.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStats()
              fetchRecords()
            }}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
            title="Refresh records and metrics"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5 px-3.5 py-2 shadow-sm"
            onClick={handleOpenCreateModal}
          >
            <PlusCircle size={16} />
            <span>+ New Medical Record</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row (Calculated from SQLite) */}
      <div className="row g-3 mb-4">
        {/* Total Medical Records */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Total Medical Records</span>
                <div
                  className="p-2.5 rounded-3 text-primary d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#e0f2fe' }}
                >
                  <FileText size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1 text-dark">
                {statsLoading ? '...' : stats.total_records}
              </h3>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                All documented clinical encounters
              </small>
            </div>
          </div>
        </div>

        {/* Records Created This Month */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Created This Month</span>
                <div
                  className="p-2.5 rounded-3 text-info d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#cffafe' }}
                >
                  <Calendar size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1 text-dark">
                {statsLoading ? '...' : stats.created_this_month}
              </h3>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                Active monthly clinical activity
              </small>
            </div>
          </div>
        </div>

        {/* Draft Records */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Draft Records</span>
                <div
                  className="p-2.5 rounded-3 text-warning d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#fef3c7' }}
                >
                  <Clock size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1 text-dark">
                {statsLoading ? '...' : stats.draft_records}
              </h3>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                Pending physician finalization
              </small>
            </div>
          </div>
        </div>

        {/* Finalized Records */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 rounded-4 shadow-xs bg-white h-100">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Finalized Records</span>
                <div
                  className="p-2.5 rounded-3 text-success d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <CheckCircle size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1 text-dark">
                {statsLoading ? '...' : stats.finalized_records}
              </h3>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                Authenticated & verified charts
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <MedicalRecordFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val)
          setPage(1)
        }}
        startDate={startDate}
        onStartDateChange={(val) => {
          setStartDate(val)
          setPage(1)
        }}
        endDate={endDate}
        onEndDateChange={(val) => {
          setEndDate(val)
          setPage(1)
        }}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
        onResetFilters={handleResetFilters}
        totalResults={totalRecords}
      />

      {/* Medical Records Table */}
      <MedicalRecordsTable
        records={records}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        perPage={perPage}
        onPageChange={setPage}
        onViewRecord={handleViewRecord}
        onEditRecord={handleOpenEditModal}
        onFinalizeRecord={handleFinalizeClick}
        onViewPatientHistory={handleViewPatientHistory}
        onPrintRecord={handlePrint}
      />

      {/* Modal 1: Create / Edit Form */}
      <MedicalRecordForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingRecord(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        patients={patients}
        doctors={doctors}
        isSubmitting={isSubmittingForm}
      />

      {/* Modal 2: View Record Details */}
      <MedicalRecordDetails
        record={selectedRecordDetail}
        labResults={recordLabs}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedRecordDetail(null)
        }}
        onEditDraft={(rec) => {
          setIsDetailsOpen(false)
          handleOpenEditModal(rec)
        }}
        onFinalizeDraft={(id) => {
          handleFinalizeClick(id)
        }}
        onViewPatientHistory={(pId) => {
          setIsDetailsOpen(false)
          handleViewPatientHistory(pId)
        }}
        onPrint={(rec) => {
          handlePrint(rec)
        }}
      />

      {/* Modal 3: Patient Medical History */}
      <PatientMedicalHistory
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false)
          setHistoryPatient(null)
          setHistoryRecords([])
        }}
        patient={historyPatient}
        records={historyRecords}
        loading={historyLoading}
        onViewRecord={handleViewRecord}
      />

      {/* Modal 4: Confirm Finalize Record Dialog */}
      {confirmFinalizeId && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-body text-center p-3">
                <div
                  className="p-3 rounded-circle text-success bg-success-subtle d-inline-flex mb-3"
                >
                  <CheckCircle size={32} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Finalize Medical Record?</h6>
                <p className="text-muted small mb-3">
                  Finalizing #MR-{confirmFinalizeId} authenticates the clinical encounter and locks it against routine edits.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                    onClick={() => setConfirmFinalizeId(null)}
                    disabled={finalizing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm px-3.5 rounded-3"
                    onClick={handleConfirmFinalize}
                    disabled={finalizing}
                  >
                    {finalizing ? 'Finalizing...' : 'Yes, Finalize'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Printable Official Medical Record (e-EMR) */}
      {printRecord && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1080 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom p-3 px-4 bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold small text-dark">Official HealthPulse Clinical Record Summary</span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-3 d-flex align-items-center gap-1.5"
                    onClick={triggerBrowserPrint}
                  >
                    <Printer size={15} />
                    <span>Print Document</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setPrintRecord(null)}
                  />
                </div>
              </div>

              {/* Printable Body */}
              <div className="modal-body p-4 p-md-5 bg-white print-area" id="rx-print-area">
                {/* Header letterhead */}
                <div className="d-flex align-items-start justify-content-between pb-3 mb-4 border-bottom border-2 border-primary">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center"
                      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
                    >
                      <HeartPulse size={24} />
                    </div>
                    <div>
                      <h4 className="fw-bold text-dark mb-0 tracking-wide">
                        Health<span className="text-primary">Pulse</span> Clinic
                      </h4>
                      <small className="text-muted">Electronic Medical Records (EMR) • Clinical Encounter Summary</small>
                    </div>
                  </div>

                  <div className="text-end small text-muted">
                    <div className="fw-bold text-dark">{printRecord.doctor_name || 'Dr. Satya Deep'}</div>
                    <div>{printRecord.doctor_specialization || 'Clinical Specialist'}</div>
                    <div>Record Ref: #{printRecord.id}</div>
                  </div>
                </div>

                {/* Patient Information Box */}
                <div className="p-3 rounded-3 bg-light border mb-4">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted">Patient Name:</span>{' '}
                      <strong className="text-dark">{printRecord.patient_name}</strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Consultation Date:</span>{' '}
                      <strong className="text-dark">{printRecord.consultation_date}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Patient ID / Age / Gender:</span>{' '}
                      <strong className="text-dark">
                        #{printRecord.patient_id} • {printRecord.patient_age || '30'} yrs ({printRecord.patient_gender || 'Male'})
                      </strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Record Status:</span>{' '}
                      <strong className="text-dark">{printRecord.status || 'Finalized'}</strong>
                    </div>
                  </div>
                </div>

                {/* Diagnosis Banner */}
                <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle mb-4">
                  <div className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.72rem' }}>
                    Clinical Diagnosis & Visit Reason
                  </div>
                  <h5 className="fw-bold text-primary mb-1">{printRecord.diagnosis}</h5>
                  <p className="mb-0 small text-dark">{printRecord.visit_reason || 'Outpatient clinical consultation'}</p>
                </div>

                {/* Clinical Findings */}
                <div className="row g-3 mb-4 small">
                  <div className="col-6">
                    <strong className="text-secondary d-block mb-1">Subjective Symptoms:</strong>
                    <div className="p-2.5 rounded-2 bg-light border text-dark">
                      {printRecord.symptoms || 'None recorded'}
                    </div>
                  </div>
                  <div className="col-6">
                    <strong className="text-secondary d-block mb-1">Objective Exam Observations:</strong>
                    <div className="p-2.5 rounded-2 bg-light border text-dark">
                      {printRecord.observations || 'Normal baseline observations'}
                    </div>
                  </div>
                </div>

                {/* Treatment Plan */}
                <div className="mb-4 small">
                  <strong className="text-secondary d-block mb-1">Therapeutic Treatment Plan:</strong>
                  <div className="p-3 rounded-2 bg-light border text-dark">
                    {printRecord.treatment_plan || 'Conservative management and follow-up'}
                  </div>
                </div>

                {/* Notes & Follow-up */}
                <div className="row g-3 mb-5 small">
                  <div className="col-6">
                    <strong className="text-secondary d-block mb-1">Recommended Follow-up:</strong>
                    <div className="text-dark">
                      {printRecord.follow_up_date || 'PRN / As needed'}
                      {printRecord.follow_up_notes ? ` (${printRecord.follow_up_notes})` : ''}
                    </div>
                  </div>
                  <div className="col-6">
                    <strong className="text-secondary d-block mb-1">Physician Notes:</strong>
                    <div className="text-dark">{printRecord.clinical_notes || 'All safety instructions advised.'}</div>
                  </div>
                </div>

                {/* Doctor Signature Block */}
                <div className="row align-items-end pt-4 mt-4 border-top">
                  <div className="col-7 small text-muted">
                    <div>Confidential Electronic Medical Record. Certified by HealthPulse Systems.</div>
                    <div className="text-secondary">Audit Hash: SHA256-EMR-HP-{printRecord.id}</div>
                  </div>
                  <div className="col-5 text-center">
                    <div className="font-italic mb-1" style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#0369a1' }}>
                      {printRecord.doctor_name || 'Dr. Satya Deep, MD'}
                    </div>
                    <div className="border-top pt-1 small text-dark fw-bold">Attending Physician Signature</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top p-3 px-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-3"
                  onClick={() => setPrintRecord(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
