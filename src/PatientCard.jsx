function PatientCard({ patient }) {
    const isFemale = (patient.gender || '').toLowerCase() === 'female'
    const initials = (patient.name || 'P')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    // Determine badge color for common conditions
    const getDiseaseBadgeClass = (disease = '') => {
        const d = disease.toLowerCase()
        if (d.includes('heart') || d.includes('cardio') || d.includes('brain')) {
            return 'bg-danger-subtle text-danger border border-danger-subtle'
        }
        if (d.includes('bone') || d.includes('muscle')) {
            return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
        }
        return 'bg-info-subtle text-info-emphasis border border-info-subtle'
    }

    return (
        <div className="card patient-card h-100">
            <div className="card-body p-4 d-flex flex-column">
                {/* Header: Avatar, Name & Disease */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className={`patient-avatar ${isFemale ? 'female' : ''}`}>
                            {initials}
                        </div>
                        <div>
                            <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.05rem' }}>
                                {patient.name}
                            </h5>
                            <a
                                href={`mailto:${patient.email}`}
                                className="text-muted small text-decoration-none d-flex align-items-center gap-1"
                                title="Send email"
                            >
                                <i className="bi bi-envelope"></i>
                                <span className="text-truncate" style={{ maxWidth: '140px' }}>
                                    {patient.email}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Disease Tag */}
                <div className="mb-3">
                    <span className={`disease-badge ${getDiseaseBadgeClass(patient.disease)}`}>
                        <i className="bi bi-clipboard2-pulse me-1"></i>
                        {patient.disease || 'General Checkup'}
                    </span>
                </div>

                {/* Vitals & Metrics Chips */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="metric-chip" title="Age">
                        <i className="bi bi-calendar-event text-primary"></i>
                        {patient.age} yrs
                    </span>
                    <span className="metric-chip" title="Weight">
                        <i className="bi bi-speedometer text-success"></i>
                        {patient.weight} kg
                    </span>
                    <span className="metric-chip text-capitalize" title="Gender">
                        <i className={`bi ${isFemale ? 'bi-gender-female text-danger' : 'bi-gender-male text-info'}`}></i>
                        {patient.gender}
                    </span>
                </div>

                {/* Doctor Section (Pushed to bottom) */}
                <div className="doctor-section mt-auto">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-heart-pulse-fill text-danger fs-5"></i>
                            <div>
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem', lineHeight: 1.1 }}>
                                    Attending Physician
                                </small>
                                <span className="fw-semibold text-dark small">
                                    Dr. {patient.doctor?.name || 'Unassigned'}
                                </span>
                            </div>
                        </div>
                        <span className="badge bg-light text-secondary border small text-capitalize" style={{ fontSize: '0.7rem' }}>
                            {patient.doctor?.specialization || 'General'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientCard