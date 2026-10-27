import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DoctorSidebar from './DoctorSidebar.jsx'
import DoctorTopbar from './DoctorTopbar.jsx'

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Persistent Sidebar */}
      <DoctorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: '260px',
          minWidth: 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <DoctorTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchValue={globalSearch}
          onSearch={setGlobalSearch}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />

        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>
    </div>
  )
}
