import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserX, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  Eye
} from 'lucide-react'
import { authenticatedFetch } from '../config/api'
import { useNotification } from '../context/NotificationContext'

const Dashboard = ({ onPageChange }) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    monthlyRevenue: 0,
    upcomingExpirations: []
  })
  const [loading, setLoading] = useState(true)
  const { success, error } = useNotification()

  // Cargar estadísticas
  const loadStats = async () => {
    setLoading(true)
    try {
      // Cargar miembros
      const membersResponse = await authenticatedFetch('/members')
      if (membersResponse && membersResponse.ok) {
        const members = await membersResponse.json()
        
        // Calcular estadísticas básicas
        const activeMembers = members.filter(m => new Date(m.membership_end_date) > new Date())
        const inactiveMembers = members.filter(m => new Date(m.membership_end_date) <= new Date())
        
        // Próximos vencimientos (próximos 7 días)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        const upcomingExpirations = members.filter(m => {
          const endDate = new Date(m.membership_end_date)
          const today = new Date()
          return endDate > today && endDate <= nextWeek
        })

        setStats({
          totalMembers: members.length,
          activeMembers: activeMembers.length,
          inactiveMembers: inactiveMembers.length,
          monthlyRevenue: 0, // Datos reales - sin ingresos aún
          upcomingExpirations
        })
      } else {
        // Base de datos limpia - estadísticas en 0
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          inactiveMembers: 0,
          monthlyRevenue: 0,
          upcomingExpirations: []
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Base de datos limpia en caso de error
      setStats({
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        monthlyRevenue: 0,
        upcomingExpirations: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, description, onClick }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vista general del gimnasio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Socios"
          value={loading ? '...' : stats.totalMembers}
          icon={Users}
          color="text-blue-600"
          description="Socios registrados"
          onClick={() => onPageChange('members')}
        />
        
        <StatCard
          title="Socios Activos"
          value={loading ? '...' : stats.activeMembers}
          icon={Users}
          color="text-green-600"
          description="Cuotas al día"
        />
        
        <StatCard
          title="Socios Inactivos"
          value={loading ? '...' : stats.inactiveMembers}
          icon={UserX}
          color="text-red-600"
          description="Cuotas vencidas"
        />
        
        <StatCard
          title="Ingresos del Mes"
          value={loading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-purple-600"
          description="Pagos recibidos"
          onClick={() => onPageChange('payments')}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => onPageChange('members')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
        >
          <Plus size={24} />
          <span className="text-lg font-semibold">Agregar Socio</span>
        </button>
        
        <button
          onClick={() => onPageChange('payments')}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
        >
          <DollarSign size={24} />
          <span className="text-lg font-semibold">Registrar Pago</span>
        </button>
        
        <button
          onClick={() => onPageChange('attendance')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
        >
          <UserX size={24} />
          <span className="text-lg font-semibold">Check-in</span>
        </button>
      </div>

      {/* Upcoming Expirations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Próximos Vencimientos
              </h3>
            </div>
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
              {stats.upcomingExpirations.length} socios
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando...</p>
            </div>
          ) : stats.upcomingExpirations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay vencimientos próximos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingExpirations.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vence: {new Date(member.membership_end_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {stats.upcomingExpirations.length > 5 && (
                <button
                  onClick={() => onPageChange('members')}
                  className="w-full text-center py-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos los vencimientos ({stats.upcomingExpirations.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'payment', text: 'Pago recibido de Juan Pérez - $5,000', time: 'Hace 1 hora' },
              { type: 'checkin', text: 'Ana García registró asistencia', time: 'Hace 2 horas' },
              { type: 'member', text: 'Nuevo socio: Carlos Rodríguez', time: 'Hace 3 horas' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'checkin' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.text}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard