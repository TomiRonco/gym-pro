import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Building, 
  Clock, 
  CreditCard, 
  Save,
  Plus,
  Edit2,
  Trash2,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  Calendar,
  ChevronDown,
  Check,
  Edit3,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react'
import { settingsService } from '../services/settingsService'
import { membershipService } from '../services/membershipService'
import { useNotification } from '../context/NotificationContext'
import { useSimpleConfirm } from '../hooks/useConfirm'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('gym')
  const [loading, setLoading] = useState(false)
  const { success, error } = useNotification()

  const tabs = [
    { id: 'gym', label: 'Información del Gimnasio', icon: Building },
    { id: 'schedules', label: 'Horarios', icon: Clock },
    { id: 'plans', label: 'Planes de Membresía', icon: CreditCard }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'gym':
        return <GymInfoSettings loading={loading} setLoading={setLoading} success={success} error={error} />
      case 'schedules':
        return <ScheduleSettings />
      case 'plans':
        return <MembershipPlansSettings />
      default:
        return <GymInfoSettings loading={loading} setLoading={setLoading} success={success} error={error} />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Configuración
        </h1>
        <p className="mt-2 text-lg text-indigo-100">Gestiona la configuración del gimnasio, horarios y planes</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

// Componente para configuración de información del gimnasio
const GymInfoSettings = ({ loading, setLoading, success, error }) => {
  const [gymData, setGymData] = useState({
    gym_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    description: '',
    logo_url: ''
  })

  useEffect(() => {
    loadGymSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadGymSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getGymSettings()
      setGymData(data)
    } catch {
      error('Error al Cargar', 'No se pudieron cargar los datos del gimnasio')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await settingsService.updateGymSettings(gymData)
      success('Configuración Actualizada', 'Los datos del gimnasio se han guardado exitosamente')
    } catch {
      error('Error al Guardar', 'No se pudieron actualizar los datos del gimnasio')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setGymData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building size={24} className="mr-3 text-indigo-600" />
          Información del Gimnasio
        </h2>
        <p className="mt-2 text-gray-600">Configura los datos básicos y de contacto de tu gimnasio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building size={20} className="mr-2 text-blue-600" />
            Información Básica
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Gimnasio
            </label>
            <input
              type="text"
              value={gymData.gym_name}
              onChange={(e) => handleInputChange('gym_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mi Gimnasio"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="inline mr-1" />
              Dirección
            </label>
            <textarea
              value={gymData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa del gimnasio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={gymData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del gimnasio y servicios"
            />
          </div>
        </div>

        {/* Contacto y redes sociales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Phone size={20} className="mr-2 text-blue-600" />
            Contacto y Redes Sociales
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} className="inline mr-1" />
              Teléfono
            </label>
            <input
              type="tel"
              value={gymData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={gymData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contacto@migimnasio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe size={16} className="inline mr-1" />
              Sitio Web
            </label>
            <input
              type="url"
              value={gymData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.migimnasio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Instagram size={16} className="inline mr-1" />
              Instagram
            </label>
            <input
              type="text"
              value={gymData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@migimnasio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook size={16} className="inline mr-1" />
              Facebook
            </label>
            <input
              type="text"
              value={gymData.facebook}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mi Gimnasio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle size={16} className="inline mr-1" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={gymData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+54 11 1234-5678"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Save size={20} />
          <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>
      </form>
    </div>
  )
}

// Componente para configuración de horarios
const ScheduleSettings = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const { success, error } = useNotification()
  const { confirm, ConfirmDialog } = useSimpleConfirm()

  const [formData, setFormData] = useState({
    day_of_week: 0,
    name: '',
    opening_time: '',
    closing_time: '',
    is_open: true,
    notes: ''
  })

  const daysOfWeek = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ]

  useEffect(() => {
    loadSchedules()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getSchedules()
      setSchedules(data)
    } catch {
      error('Error de Conexión', 'No se pudieron cargar los horarios. Verifique su conexión a internet')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (editingSchedule) {
        const updatedSchedule = await settingsService.updateSchedule(editingSchedule.id, formData)
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s))
        success('Horario Actualizado', `El horario "${formData.name}" ha sido modificado exitosamente`)
      } else {
        const newSchedule = await settingsService.createSchedule(formData)
        setSchedules(prev => [...prev, newSchedule])
        success('Horario Creado', `Se ha agregado "${formData.name}" para ${daysOfWeek[formData.day_of_week]}`)
      }
      
      handleCloseModal()
    } catch (err) {
      const action = editingSchedule ? 'actualizar' : 'crear'
      error('Error de Validación', err.message || `No se pudo ${action} el horario. Verifique los datos ingresados`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      day_of_week: schedule.day_of_week,
      name: schedule.name,
      opening_time: schedule.opening_time,
      closing_time: schedule.closing_time,
      is_open: schedule.is_open,
      notes: schedule.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (scheduleId) => {
    const scheduleToDelete = schedules.find(s => s.id === scheduleId)
    const scheduleName = scheduleToDelete ? scheduleToDelete.name : 'este horario'
    
    const confirmed = await confirm({
      title: 'Eliminar Horario',
      message: `¿Estás seguro de que deseas eliminar "${scheduleName}"?`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })
    
    if (!confirmed) return

    try {
      setLoading(true)
      await settingsService.deleteSchedule(scheduleId)
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
      success('Horario Eliminado', `"${scheduleName}" ha sido eliminado del sistema`)
    } catch (error) {
      error('Error al Eliminar', `No se pudo eliminar "${scheduleName}". Intente nuevamente`)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSchedule(null)
    setFormData({
      day_of_week: 0,
      name: '',
      opening_time: '',
      closing_time: '',
      is_open: true,
      notes: ''
    })
  }

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = []
    }
    acc[schedule.day_of_week].push(schedule)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock size={24} className="mr-3 text-indigo-600" />
              Horarios del Gimnasio
            </h2>
            <p className="mt-2 text-gray-600">Configura los horarios de atención por día de la semana</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-md min-w-[140px] justify-center"
          >
            <Plus size={20} />
            <span>Agregar Horario</span>
          </button>
        </div>
      </div>

      {/* Schedules by day */}
      <div className="grid gap-6">
        {daysOfWeek.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar size={20} className="mr-2 text-blue-600" />
                {day}
              </h4>
            </div>

            <div className="space-y-3">
              {groupedSchedules[dayIndex] && groupedSchedules[dayIndex].length > 0 ? (
                groupedSchedules[dayIndex]
                  .sort((a, b) => a.opening_time.localeCompare(b.opening_time))
                  .map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${schedule.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="font-medium text-gray-900">{schedule.name}</span>
                          </div>
                          <span className="text-gray-600">
                            {schedule.opening_time} - {schedule.closing_time}
                          </span>
                          {schedule.notes && (
                            <span className="text-sm text-gray-500">({schedule.notes})</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>No hay horarios configurados para {day.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding/editing schedule */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSchedule ? 'Editar Horario' : 'Agregar Horario'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de la semana
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del horario
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej: Horario Mañana, Horario Tarde"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de apertura
                  </label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de cierre
                  </label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_open}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_open: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Horario activo</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional sobre este horario"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check size={16} className="mr-2" />
                  )}
                  {loading ? 'Guardando...' : (editingSchedule ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showModal && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando horarios...</p>
        </div>
      )}

      <ConfirmDialog />
    </div>
  )
}

// Componente para gestión de planes de membresía
const MembershipPlansSettings = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  const { success, error } = useNotification()
  const { confirm, ConfirmDialog } = useSimpleConfirm()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    days_per_week: 1,
    features: '',
    is_active: true
  })

  const weeklyOptions = [
    { value: 1, label: '1 día por semana', description: 'Ideal para principiantes' },
    { value: 2, label: '2 días por semana', description: 'Rutina básica de ejercicio' },
    { value: 3, label: '3 días por semana', description: 'Entrenamiento balanceado' },
    { value: 4, label: '4 días por semana', description: 'Entrenamiento intensivo' },
    { value: 5, label: '5 días por semana', description: 'Para deportistas' },
    { value: 6, label: '6 días por semana', description: 'Entrenamiento avanzado' },
    { value: 7, label: '7 días por semana', description: 'Acceso libre completo' }
  ]

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await membershipService.getPlans()
      setPlans(data)
    } catch {
      error('Error al Cargar', 'No se pudieron cargar los planes de membresía')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      days_per_week: 1,
      features: '',
      is_active: true
    })
    setEditingPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price)
      }

      if (editingPlan) {
        await membershipService.updatePlan(editingPlan.id, planData)
        success('Plan Actualizado', 'El plan de membresía se ha actualizado exitosamente')
      } else {
        await membershipService.createPlan(planData)
        success('Plan Creado', 'El nuevo plan de membresía se ha creado exitosamente')
      }

      setShowModal(false)
      resetForm()
      await loadPlans()
    } catch {
      error('Error', editingPlan ? 'Error al actualizar el plan' : 'Error al crear el plan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      days_per_week: plan.days_per_week,
      features: plan.features || '',
      is_active: plan.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (plan) => {
    const confirmed = await confirm(
      `¿Estás seguro de que quieres eliminar el plan "${plan.name}"?`,
      'Esta acción no se puede deshacer.'
    )

    if (confirmed) {
      try {
        setLoading(true)
        await membershipService.deletePlan(plan.id)
        success('Plan Eliminado', 'El plan de membresía se ha eliminado exitosamente')
        await loadPlans()
      } catch {
        error('Error', 'Error al eliminar el plan')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star size={24} className="mr-3 text-indigo-600" />
              Planes de Membresía
            </h2>
            <p className="mt-2 text-gray-600">Gestiona los planes y precios de las membresías del gimnasio</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-md min-w-[140px] justify-center"
          >
            <Plus size={20} />
            <span>Nuevo Plan</span>
          </button>
        </div>
      </div>
      {/* Lista de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && plans.length === 0 ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes disponibles</h3>
            <p className="text-gray-600 mb-4">Comienza creando tu primer plan de membresía</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {plan.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" title="Activo" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" title="Inactivo" />
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {formatPrice(plan.price)}
              </div>

              {/* Detalles */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {plan.days_per_week} {plan.days_per_week === 1 ? 'día' : 'días'} por semana
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Vencimiento: 1 mes desde el inicio
                </div>
              </div>

              {/* Características */}
              {plan.features && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Características:</h4>
                  <div className="text-sm text-gray-600">
                    {(() => {
                      try {
                        const features = JSON.parse(plan.features)
                        return (
                          <ul className="space-y-1">
                            {features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )
                      } catch {
                        return <span>{plan.features}</span>
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingPlan ? 'Editar Plan de Membresía' : 'Nuevo Plan de Membresía'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Plan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Plan Mensual Premium"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe las características principales del plan..."
                />
              </div>

              {/* Días por semana y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días por Semana *
                  </label>
                  <select
                    required
                    value={formData.days_per_week}
                    onChange={(e) => handleInputChange('days_per_week', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {weeklyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Características */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Características
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Acceso completo, clases grupales, asesoramiento nutricional..."
                />
              </div>

              {/* Estado */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Plan activo (disponible para nuevas membresías)
                </label>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {editingPlan ? 'Actualizar' : 'Crear'} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  )
}

export default SettingsPage