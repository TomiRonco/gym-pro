import React, { useState, useEffect } from 'react'
import { 
  Search, 
  UserCheck, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react'
import { authenticatedFetch } from '../config/api'
import { useNotification } from '../context/NotificationContext'

const Attendance = () => {
  const [members, setMembers] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const { success } = useNotification()

  // Cargar datos
  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar miembros
      const membersResponse = await authenticatedFetch('/members')
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData)
      }

      // Base de datos limpia - sin registros de asistencia simulados
      setAttendanceRecords([])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar miembros por búsqueda
  const filteredMembers = members.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membership_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Registrar asistencia
  const handleCheckIn = async (member) => {
    const isActive = new Date(member.membership_end_date) > new Date()
    
    if (!isActive) {
      if (!window.confirm('Este socio tiene la cuota vencida. ¿Deseas registrar la asistencia de todos modos?')) {
        return
      }
    }

    // Simular registro de asistencia
    const newRecord = {
      id: Date.now(),
      member: member,
      check_in_time: new Date().toISOString(),
      membership_status: isActive ? 'active' : 'expired'
    }

    setAttendanceRecords(prev => [newRecord, ...prev])
    setSelectedMember(null)
    setSearchTerm('')
    success(`Asistencia registrada para ${member.first_name} ${member.last_name}`, 'Check-in exitoso')
  }

  // Filtrar registros de asistencia de hoy
  const todayRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.check_in_time).toDateString()
    const today = new Date().toDateString()
    return recordDate === today
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
        <p className="text-gray-600">Registro de check-in y validación de socios</p>
      </div>

      {/* Check-in Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Asistencia</h2>
        
        {/* Buscador */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, número de socio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron socios</p>
              </div>
            ) : (
              filteredMembers.slice(0, 5).map((member) => {
                const isActive = new Date(member.membership_end_date) > new Date()
                const lastVisit = attendanceRecords
                  .filter(r => r.member.membership_number === member.membership_number)
                  .sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time))[0]

                return (
                  <div 
                    key={member.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.first_name} {member.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {member.membership_number} • {member.membership_type}
                          </p>
                          {lastVisit && (
                            <p className="text-xs text-gray-400">
                              Última visita: {new Date(lastVisit.check_in_time).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? 'Activo' : 'Vencido'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCheckIn(member)
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isActive
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          <UserCheck size={16} className="inline mr-2" />
                          Check-in
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{todayRecords.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Socios Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {todayRecords.filter(r => r.membership_status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cuotas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">
                {todayRecords.filter(r => r.membership_status === 'expired').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial de asistencia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Asistencias Recientes</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando asistencias...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay registros de asistencia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Socio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hora de Entrada</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado de Cuota</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.slice(0, 20).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.member.first_name} {record.member.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.member.membership_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(record.check_in_time).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 w-fit ${
                        record.membership_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.membership_status === 'active' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{record.membership_status === 'active' ? 'Al día' : 'Vencida'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(record.check_in_time).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles del socio */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Socio</h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedMember.first_name} {selectedMember.last_name}
                </h3>
                <p className="text-gray-500">{selectedMember.membership_number}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="text-gray-900">{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membresía:</span>
                  <span className="text-gray-900 capitalize">{selectedMember.membership_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className={`font-medium ${
                    new Date(selectedMember.membership_end_date) > new Date()
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {new Date(selectedMember.membership_end_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleCheckIn(selectedMember)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <UserCheck size={20} />
                  <span>Registrar Asistencia</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance