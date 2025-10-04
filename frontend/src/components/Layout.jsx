import React from 'react'
import { 
  Home, 
  Users, 
  CreditCard, 
  UserCheck, 
  Settings, 
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

const Layout = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth()
  const { success } = useNotification()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Socios', icon: Users },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'attendance', label: 'Asistencia', icon: UserCheck },
  ]

  const handleLogout = () => {
    logout()
    success('Sesión cerrada exitosamente', 'Hasta luego')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">🏋️</span>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">GymPro</h1>
              <p className="text-sm text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="ml-3 font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* User Info & Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@gym.com'}
              </p>
            </div>
            
            {/* Settings Button - Solo icono */}
            <button
              onClick={() => onPageChange('settings')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Configuración"
            >
              <Settings size={16} />
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout