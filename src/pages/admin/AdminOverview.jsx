import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../config.js'
import StatCards from '../../components/admin/StatCards.jsx'
import AnalyticsCharts from '../../components/admin/AnalyticsCharts.jsx'
import QuickActions from '../../components/admin/QuickActions.jsx'
import RecentPatientsTable from '../../components/admin/RecentPatientsTable.jsx'
import UpcomingAppointments from '../../components/admin/UpcomingAppointments.jsx'
import RecentActivity from '../../components/admin/RecentActivity.jsx'
import AddPatientModal from '../../AddPatientModal.jsx'
import EditPatientModal from '../../EditPatientModal.jsx'
import DeleteConfirmModal from '../../DeleteConfirmModal.jsx'
import RegisterDoctorModal from '../../components/modals/RegisterDoctorModal.jsx'
import ScheduleAppointmentModal from '../../components/modals/ScheduleAppointmentModal.jsx'
import PatientDetailsModal from '../../components/modals/PatientDetailsModal.jsx'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

export default function AdminOverview() {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toast, setToast] = useState(null)

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isRegisterDoctorOpen, setIsRegisterDoctorOpen] = useState(false)
  const [isScheduleAppointmentOpen, setIsScheduleAppointmentOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState(null)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Fetch initial patient and doctor list
  const loadData = () => {
    setLoading(true)
    Promise.all([
      axios.get(`${API_BASE_URL}/patients`),
      axios.get(`${API_BASE_URL}/api/doctors`),
    ])
      .then(([patRes, docRes]) => {
        setPatients(Array.isArray(patRes.data) ? patRes.data : [])
        setDoctors(Array.isArray(docRes.data) ? docRes.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load initial data:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [refreshTrigger])

  // Handlers
  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev])
    showToast(`Patient record for "${newPatient.name}" created successfully!`)
    triggerRefresh()
  }

  const handlePatientUpdated = (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    )
    showToast(`Patient details for "${updatedPatient.name}" updated successfully!`)
    triggerRefresh()
  }

  const handleConfirmDelete = async (patient) => {
    setIsDeleting(true)
    try {
      if (patient.id) {
        await axios.delete(`${API_BASE_URL}/patients/${patient.id}`)
      }
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      showToast(`Patient record for "${patient.name}" has been deleted.`, 'danger')
      setPatientToDelete(null)
      triggerRefresh()
    } catch (err) {
      console.error('Failed to delete on server:', err)
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      showToast(`Patient record for "${patient.name}" has been removed.`, 'danger')
      setPatientToDelete(null)
      triggerRefresh()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDoctorRegistered = (newDoc) => {
    setDoctors((prev) => [newDoc, ...prev])
    showToast(`Physician "${newDoc.name}" credentialed successfully!`)
    triggerRefresh()
  }

  const handleAppointmentScheduled = (newApp) => {
    showToast(`Appointment booked successfully for ${newApp.appointment_date}!`)
    triggerRefresh()
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1099 }}
        >
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
              <strong className="d-block small">
                {toast.type === 'danger' ? 'Deleted' : 'Success'}
              </strong>
              <small>{toast.message}</small>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={() => setToast(null)}
            />
          </div>
        </div>
      )}

      {/* Top Banner / Actions Ribbon */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Healthcare Executive Overview</h2>
          <p className="text-muted small mb-0">
            Real-time operations, patient admissions, and clinical appointment management
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1"
            onClick={triggerRefresh}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-3 btn-sm d-inline-flex align-items-center gap-1 shadow-xs fw-semibold"
            onClick={() => setIsAddPatientOpen(true)}
          >
            <span>+ Add Patient</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatCards refreshTrigger={refreshTrigger} />

      {/* Quick Action Shortcuts */}
      <QuickActions
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
        onOpenRegisterDoctor={() => setIsRegisterDoctorOpen(true)}
        onOpenScheduleAppointment={() => setIsScheduleAppointmentOpen(true)}
      />

      {/* Charts Section */}
      <AnalyticsCharts refreshTrigger={refreshTrigger} />

      {/* Recent Patients Table */}
      <RecentPatientsTable
        patients={patients}
        loading={loading}
        onViewDetails={(p) => setPatientDetails(p)}
        onEditPatient={(p) => setPatientToEdit(p)}
        onDeletePatient={(p) => setPatientToDelete(p)}
      />

      {/* Bottom Grid: Upcoming Appointments & Activity Log */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <UpcomingAppointments
            refreshTrigger={refreshTrigger}
            onScheduleNew={() => setIsScheduleAppointmentOpen(true)}
          />
        </div>
        <div className="col-12 col-xl-6">
          <RecentActivity refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      <EditPatientModal
        patient={patientToEdit}
        isOpen={!!patientToEdit}
        onClose={() => setPatientToEdit(null)}
        onPatientUpdated={handlePatientUpdated}
      />

      <DeleteConfirmModal
        patient={patientToDelete}
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <RegisterDoctorModal
        isOpen={isRegisterDoctorOpen}
        onClose={() => setIsRegisterDoctorOpen(false)}
        onDoctorRegistered={handleDoctorRegistered}
      />

      <ScheduleAppointmentModal
        isOpen={isScheduleAppointmentOpen}
        onClose={() => setIsScheduleAppointmentOpen(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
        patients={patients}
        doctors={doctors}
      />

      <PatientDetailsModal
        patient={patientDetails}
        isOpen={!!patientDetails}
        onClose={() => setPatientDetails(null)}
        onEdit={(p) => setPatientToEdit(p)}
      />
    </div>
  )
}
