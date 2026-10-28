import { Search, Filter, Calendar, RotateCcw, ArrowUpDown } from 'lucide-react'

export default function MedicalRecordFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortDir,
  onSortDirChange,
  onResetFilters,
  totalResults,
}) {
  const hasActiveFilters = search || status !== 'ALL' || startDate || endDate || sortDir !== 'desc'

  return (
    <div className="card border-0 rounded-4 shadow-xs bg-white mb-4">
      <div className="card-body p-3.5">
        <div className="row g-2.5 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-5 col-xl-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 py-2"
                placeholder="Search patient, doctor, diagnosis, ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-3 col-xl-2">
            <div className="d-flex align-items-center gap-1.5">
              <Filter size={15} className="text-muted d-none d-sm-block flex-shrink-0" />
              <select
                className="form-select bg-light py-2"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Finalized">Finalized</option>
                <option value="Draft">Drafts Only</option>
                <option value="Amended">Amended</option>
                <option value="ReviewRequired">Review Required</option>
              </select>
            </div>
          </div>

          {/* Date Range: Start */}
          <div className="col-6 col-md-2 col-xl-2">
            <input
              type="date"
              className="form-control bg-light py-2"
              title="Filter from consultation date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Date Range: End */}
          <div className="col-6 col-md-2 col-xl-2">
            <input
              type="date"
              className="form-control bg-light py-2"
              title="Filter until consultation date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          {/* Sort & Reset Actions */}
          <div className="col-6 col-md-12 col-xl-2 d-flex align-items-center justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm py-2 px-2.5 rounded-3 d-flex align-items-center gap-1.5 flex-grow-1 flex-xl-grow-0 justify-content-center"
              onClick={() => onSortDirChange(sortDir === 'desc' ? 'asc' : 'desc')}
              title={`Sort: ${sortDir === 'desc' ? 'Newest to Oldest' : 'Oldest to Newest'}`}
              style={{ fontSize: '0.82rem' }}
            >
              <ArrowUpDown size={14} />
              <span>{sortDir === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-light btn-sm py-2 px-2.5 rounded-3 text-danger border d-flex align-items-center gap-1 flex-shrink-0"
                onClick={onResetFilters}
                title="Reset all filters"
                style={{ fontSize: '0.82rem' }}
              >
                <RotateCcw size={14} />
                <span className="d-none d-sm-inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
