import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sun,
  Coffee,
  Moon,
  Sparkles,
} from 'lucide-react'
import { API_BASE_URL } from '../../config.js'

const DEFAULT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE_URL}/api/doctor/schedule`)
      const list = Array.isArray(res.data) ? res.data : (res.data.schedule || [])

      // If empty, populate with default days
      if (list.length === 0) {
        const defaults = DEFAULT_DAYS.map((day) => ({
          day_of_week: day,
          start_time: '09:00 AM',
          end_time: '05:00 PM',
          slot_duration_minutes: 30,
          status: day === 'Saturday' || day === 'Sunday' ? 'Off' : 'Available',
        }))
        setSchedules(defaults)
      } else {
        setSchedules(list)
      }
    } catch (err) {
      console.error('Failed to load schedule:', err)
      setError(err.response?.data?.error || 'Failed to load doctor schedule.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  const handleDayChange = (index, field, value) => {
    const updated = [...schedules]
    updated[index] = { ...updated[index], [field]: value }
    setSchedules(updated)
  }

  const handleApplyWeekdayTemplate = () => {
    const updated = schedules.map((item) => {
      const isWeekend = item.day_of_week === 'Saturday' || item.day_of_week === 'Sunday'
      return {
        ...item,
        status: isWeekend ? 'Off' : 'Available',
        start_time: '09:00 AM',
        end_time: '05:00 PM',
        slot_duration_minutes: 30,
      }
    })
    setSchedules(updated)
    showToast('Applied Standard Clinic Template (Mon-Fri 9:00 AM - 5:00 PM)')
  }

  const handleSaveSchedule = async () => {
    try {
      setSaving(true)
      await axios.put(`${API_BASE_URL}/api/doctor/schedule`, {
        schedule: schedules,
      })
      showToast('Weekly clinic schedule successfully updated!')
      fetchSchedule()
    } catch (err) {
      console.error('Failed to update schedule:', err)
      showToast(err.response?.data?.error || 'Failed to update schedule.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  // Calculate working stats
  const activeDaysCount = schedules.filter((s) => s.status === 'Available').length

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

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Weekly Clinic Schedule</h1>
          <p className="text-muted small mb-0">
            Define daily operating hours, consultation slot lengths, and availability for patient appointments.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleApplyWeekdayTemplate}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3"
          >
            <Sparkles size={15} />
            <span>Apply Standard Template</span>
          </button>
          <button
            type="button"
            onClick={handleSaveSchedule}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3.5 py-2 rounded-3"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Schedule...' : 'Save Weekly Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-primary" style={{ backgroundColor: '#e0f2fe' }}>
                <Calendar size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Active Working Days</span>
                <h4 className="fw-bold mb-0 text-dark">{activeDaysCount} of 7 Days</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-info" style={{ backgroundColor: '#cffafe' }}>
                <Clock size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Default Consultation Slot</span>
                <h4 className="fw-bold mb-0 text-dark">30 Minutes</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card border-0 rounded-4 shadow-xs bg-white">
            <div className="card-body p-3.5 d-flex align-items-center gap-3">
              <div className="p-3 rounded-3 text-success" style={{ backgroundColor: '#dcfce7' }}>
                <Coffee size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Days Off</span>
                <h4 className="fw-bold mb-0 text-dark">{7 - activeDaysCount} Days</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table / Cards */}
      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 p-3 mb-4" role="alert">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card border-0 rounded-4 shadow-xs bg-white p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status">
            <span className="visually-hidden">Loading schedule...</span>
          </div>
          <p className="text-muted small mb-0">Retrieving weekly schedule...</p>
        </div>
      ) : (
        <div className="card border-0 rounded-4 shadow-xs bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-secondary small">
                  <th className="ps-4">Day of Week</th>
                  <th>Availability Status</th>
                  <th>Shift Start Time</th>
                  <th>Shift End Time</th>
                  <th>Slot Duration</th>
                  <th className="text-end pe-4">Estimated Capacity</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((day, idx) => {
                  const isAvailable = day.status === 'Available'
                  const isBreak = day.status === 'Break'
                  const isOff = day.status === 'Off'

                  return (
                    <tr key={day.day_of_week || idx}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{day.day_of_week}</div>
                        <small className="text-muted">Weekly recurrence</small>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={day.status}
                          onChange={(e) => handleDayChange(idx, 'status', e.target.value)}
                          style={{
                            width: '140px',
                            fontWeight: '600',
                            color: isAvailable ? '#16a34a' : isOff ? '#dc2626' : '#d97706',
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Break">Break Only</option>
                          <option value="Off">Day Off</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          disabled={isOff}
                          value={day.start_time || '09:00 AM'}
                          onChange={(e) => handleDayChange(idx, 'start_time', e.target.value)}
                          style={{ width: '120px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          disabled={isOff}
                          value={day.end_time || '05:00 PM'}
                          onChange={(e) => handleDayChange(idx, 'end_time', e.target.value)}
                          style={{ width: '120px' }}
                        />
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          disabled={isOff}
                          value={day.slot_duration_minutes || 30}
                          onChange={(e) =>
                            handleDayChange(idx, 'slot_duration_minutes', parseInt(e.target.value, 10))
                          }
                          style={{ width: '130px' }}
                        >
                          <option value="15">15 Minutes</option>
                          <option value="30">30 Minutes</option>
                          <option value="45">45 Minutes</option>
                          <option value="60">60 Minutes</option>
                        </select>
                      </td>
                      <td className="text-end pe-4">
                        {isAvailable ? (
                          <span className="badge bg-success-subtle text-success small">
                            ~16 appointments
                          </span>
                        ) : isOff ? (
                          <span className="badge bg-light text-muted border small">No Sessions</span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning small">Limited</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-light p-3 px-4 d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              Changes apply across all upcoming booking slots in HealthPulse.
            </span>
            <button
              type="button"
              onClick={handleSaveSchedule}
              className="btn btn-primary btn-sm px-4 rounded-3 d-flex align-items-center gap-1.5"
              disabled={saving}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Weekly Schedule'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
