import React, { useState, useEffect } from 'react'
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

  // Cambiar título de la pestaña según la sección
  useEffect(() => {
    const pageTitles = {
      'dashboard': 'Dashboard - Gym Pro',
      'members': 'Socios - Gym Pro',
      'payments': 'Pagos - Gym Pro',
      'attendance': 'Asistencia - Gym Pro',
      'settings': 'Configuración - Gym Pro'
    }

    const title = pageTitles[currentPage] || 'Gym Pro'
    document.title = title
  }, [currentPage])

  if (!isAuthenticated()) {
    // Título para login
    document.title = 'Iniciar Sesión - Gym Pro'
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
