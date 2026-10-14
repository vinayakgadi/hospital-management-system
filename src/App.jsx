import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import PatientCard from './PatientCard.jsx'

function App() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPatients = () => {
    setLoading(true)
    setError(null)
    axios
      .get('https://doc-back.onrender.com/patients')
      .then((res) => {
        setPatients(Array.isArray(res.data) ? res.data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching patients:', err)
        setError('Failed to fetch patient data from server.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      (patient.name || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [search, patients])

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-dark">Patient Dashboard</h1>
        <p className="text-muted">Manage and monitor patient health records</p>
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              🔍
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search patient by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearch('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted fs-5">Loading patient records...</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center shadow-sm">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchPatients}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-secondary mb-0">Records</h5>
            <span className="badge bg-primary rounded-pill">
              {filteredPatients.length} of {patients.length} patients
            </span>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {filteredPatients.length === 0 ? (
              <div className="col-12 w-100">
                <div className="alert alert-warning text-center py-4 shadow-sm">
                  <h6 className="mb-1">No matching patients found</h6>
                  <small className="text-muted">Try adjusting your search criteria</small>
                </div>
              </div>
            ) : (
              filteredPatients.map((patient, index) => (
                <div className="col" key={patient.id || patient._id || index}>
                  <PatientCard patient={patient} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App