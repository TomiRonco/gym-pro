import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ActivityProvider } from './context/ActivityContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'
import Settings from './pages/Settings'

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

  if (!isAuthenticated) {
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
        return <Settings />
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
        <ActivityProvider>
          <AppContent />
        </ActivityProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App
