import React, { useState } from 'react'
import { UserCheck, Clock, CheckCircle, X } from 'lucide-react'
import { useActivity } from '../context/ActivityContext'
import { useNotification } from '../context/NotificationContext'

const Attendance = () => {
  const [showModal, setShowModal] = useState(false)
  const [memberName, setMemberName] = useState('')
  const { addCheckinActivity } = useActivity()
  const { success, error } = useNotification()

  const handleCheckin = (e) => {
    e.preventDefault()
    
    if (!memberName.trim()) {
      error('Campo Requerido', 'Por favor ingresa el nombre del socio')
      return
    }
    
    // Agregar actividad de check-in
    addCheckinActivity(memberName.trim())
    
    // Mostrar notificación de éxito
    success('Check-in Registrado', `Entrada registrada para ${memberName}`)
    
    // Resetear formulario y cerrar modal
    setMemberName('')
    setShowModal(false)
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Asistencia</h1>
            <p className="mt-2 text-lg text-orange-100">Control de asistencia y check-in</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-gray-50 text-orange-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-md mt-4 sm:mt-0 min-w-[140px] justify-center"
          >
            <UserCheck size={20} />
            <span>Marcar Asistencia</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Semanal</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registro de Asistencia</h2>
        </div>
        
        <div className="p-8 text-center">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo en Desarrollo</h3>
          <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
        </div>
      </div>

      {/* Modal para marcar asistencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Marcar Asistencia</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCheckin} className="p-6 space-y-4">
              <div>
                <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Socio
                </label>
                <input
                  type="text"
                  id="memberName"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre completo del socio"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Registrar Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance