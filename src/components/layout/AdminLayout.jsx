import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNavbar from './TopNavbar.jsx'

export default function AdminLayout({ globalSearch, setGlobalSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: '260px',
          minWidth: 0,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <TopNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchValue={globalSearch}
          onSearch={setGlobalSearch}
        />

        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>
    </div>
  )
}
