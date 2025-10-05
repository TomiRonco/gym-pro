import React, { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  UserX, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Clock,
  X
} from 'lucide-react'
import { paymentsService, membersService } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { useActivity } from '../context/ActivityContext'

const Dashboard = ({ onPageChange }) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    monthlyRevenue: 0,
    currentMonth: new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
    upcomingExpirations: []
  })
  const [loading, setLoading] = useState(true)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const { success, error } = useNotification()
  const { recentActivity, addQuickCheckinActivity } = useActivity()
  
  // Estado para tracking del mes actual
  const [lastCheckedMonth, setLastCheckedMonth] = useState(new Date().getMonth())
  const [lastCheckedYear, setLastCheckedYear] = useState(new Date().getFullYear())

  // Cargar estadísticas reales
  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      // Cargar miembros usando el servicio
      const members = await membersService.getMembers()
      
      // Calcular estadísticas reales
      const activeMembers = members.filter(m => m.is_active === true)
      const inactiveMembers = members.filter(m => m.is_active === false)
      
      // Próximos vencimientos (próximos 7 días) solo de miembros activos
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const upcomingExpirations = members.filter(m => {
        if (!m.is_active || !m.membership_end_date) return false
        const endDate = new Date(m.membership_end_date)
        const today = new Date()
        return endDate > today && endDate <= nextWeek
      })

      // Cargar pagos para calcular ingresos del mes
      let monthlyRevenue = 0
      try {
        const payments = await paymentsService.getPayments()
        
        // Obtener fecha actual
        const now = new Date()
        const currentMonth = now.getMonth() // 0-11
        const currentYear = now.getFullYear()
        
        const monthlyPayments = payments.filter(p => {
          if (!p.payment_date) return false
          
          const paymentDate = new Date(p.payment_date)
          const paymentMonth = paymentDate.getMonth()
          const paymentYear = paymentDate.getFullYear()
          
          return paymentMonth === currentMonth && paymentYear === currentYear
        })
        
        monthlyRevenue = monthlyPayments.reduce((sum, p) => {
          const amount = parseFloat(p.amount) || 0
          return sum + amount
        }, 0)
      } catch (error) {
        console.error('Error cargando pagos:', error)
      }

      setStats({
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        inactiveMembers: inactiveMembers.length,
        monthlyRevenue,
        currentMonth: new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
        upcomingExpirations
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Error de conexión - mostrar estadísticas en 0
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
  }, [])

  // Función para verificar si cambió el mes
  const checkMonthChange = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    if (currentMonth !== lastCheckedMonth || currentYear !== lastCheckedYear) {
      setLastCheckedMonth(currentMonth)
      setLastCheckedYear(currentYear)
      loadStats() // Recargar estadísticas
    }
  }, [lastCheckedMonth, lastCheckedYear, setLastCheckedMonth, setLastCheckedYear, loadStats])

  // Función para ver detalles del socio
  const handleViewMember = (member) => {
    setSelectedMember(member)
    setShowMemberModal(true)
  }

  // Función para registrar check-in
  const handleQuickCheckin = async () => {
    try {
      addQuickCheckinActivity()
      success('Check-in registrado', 'Se ha registrado la entrada al gimnasio')
    } catch {
      error('Error en check-in', 'No se pudo registrar la entrada')
    }
  }

  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Recargar estadísticas cuando hay nueva actividad (pagos)
  useEffect(() => {
    // Buscar actividades de pago en la actividad reciente
    const hasRecentPayment = recentActivity.some(activity => 
      activity.type === 'payment' && 
      new Date(activity.timestamp).getTime() > Date.now() - 10000 // últimos 10 segundos
    )
    
    if (hasRecentPayment) {
      loadStats()
    }
  }, [recentActivity, loadStats])

  // Timer para verificar cambio de mes cada minuto
  useEffect(() => {
    const monthCheckInterval = setInterval(checkMonthChange, 60000) // Verificar cada minuto
    
    return () => clearInterval(monthCheckInterval)
  }, [checkMonthChange])

  // Timer para actualización general cada 5 minutos
  useEffect(() => {
    const statsInterval = setInterval(() => {
      loadStats()
    }, 5 * 60 * 1000) // 5 minutos
    
    return () => clearInterval(statsInterval)
  }, [loadStats])

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-lg text-blue-100">Vista general del gimnasio</p>
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
          title={`Ingresos de ${stats.currentMonth}`}
          value={loading ? '...' : `$${stats.monthlyRevenue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`}
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
          onClick={handleQuickCheckin}
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-3"
        >
          <Clock size={24} />
          <span className="text-lg font-semibold">Check-in Rápido</span>
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
                    <button 
                      onClick={() => handleViewMember(member)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Ver detalles del socio"
                    >
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando actividad...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Sin actividad reciente</h4>
              <p className="text-gray-500 mb-6">
                La actividad aparecerá aquí cuando haya movimientos en el gimnasio
              </p>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Pagos recibidos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Check-ins de socios</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Nuevos socios</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 6).map((activity) => {
                const getActivityIcon = (type) => {
                  switch (type) {
                    case 'checkin':
                      return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' }
                    case 'payment':
                      return { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' }
                    case 'new_member':
                      return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' }
                    default:
                      return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' }
                  }
                }

                const { icon: ActivityIcon, color, bg } = getActivityIcon(activity.type)
                const timeAgo = Math.floor((new Date() - activity.timestamp) / 1000 / 60)

                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${bg}`}>
                      <ActivityIcon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.member}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {timeAgo < 60 ? `${timeAgo}m` : `${Math.floor(timeAgo / 60)}h`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del socio */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Detalles del Socio</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">DNI: {selectedMember.dni}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{selectedMember.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Membresía</label>
                    <p className="text-gray-900 capitalize">{selectedMember.membership_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMember.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedMember.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800">Próximo a vencer</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Fecha de vencimiento: {new Date(selectedMember.membership_end_date).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Vence en {Math.ceil((new Date(selectedMember.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24))} días
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowMemberModal(false)
                    onPageChange('members')
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Ver en Socios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard