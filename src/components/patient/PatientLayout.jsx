import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import PatientSidebar from './PatientSidebar.jsx'
import PatientTopbar from './PatientTopbar.jsx'

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Persistent Patient Sidebar */}
      <PatientSidebar
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
        <PatientTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />

        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet context={{ unreadCount, setUnreadCount }} />
        </main>
      </div>
    </div>
  )
}
