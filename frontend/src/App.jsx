import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated()) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />
      case 'members':
        return <Members />
      case 'payments':
        return <Payments />
      case 'attendance':
        return <Attendance />
      case 'settings':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuración</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Módulo de configuración en desarrollo...</p>
            </div>
          </div>
        )
      default:
        return <Dashboard onPageChange={setCurrentPage} />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App
