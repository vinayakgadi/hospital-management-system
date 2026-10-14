function PatientCard({ patient }) {
    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">{patient.name}</h5>
                <p className="card-text mb-1"><strong>Weight:</strong> {patient.weight} kg</p>
                <p className="card-text mb-1"><strong>Gender:</strong> {patient.gender}</p>
                <p className="card-text mb-1"><strong>Age:</strong> {patient.age} yrs</p>
                <p className="card-text mb-1"><strong>Email:</strong> {patient.email}</p>
                <p className="card-text mb-2">
                    <strong>Disease:</strong> <span className="badge bg-danger-subtle text-danger border border-danger-subtle">{patient.disease}</span>
                </p>
                <hr className="my-2" />
                <p className="card-text mb-1"><strong>Doctor:</strong> {patient.doctor?.name || 'N/A'}</p>
                <p className="card-text text-muted small mb-0"><strong>Specialization:</strong> {patient.doctor?.specialization || 'General'}</p>
            </div>
        </div>
    )
}

export default PatientCard