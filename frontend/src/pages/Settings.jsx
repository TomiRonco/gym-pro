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
  MessageCircle
} from 'lucide-react'
import { settingsService } from '../services/settingsService'
import { useNotification } from '../context/NotificationContext'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Configuración
        </h1>
        <p className="mt-2 text-gray-600">Gestiona la configuración del gimnasio, horarios y planes</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
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
    } catch (err) {
      console.error('Error loading gym settings:', err)
      error('No se pudieron cargar los datos del gimnasio', 'Error al Cargar Datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await settingsService.updateGymSettings(gymData)
      success('Los datos del gimnasio se han guardado exitosamente', 'Configuración Actualizada')
    } catch (err) {
      console.error('Error updating gym settings:', err)
      error('No se pudieron actualizar los datos del gimnasio', 'Error al Guardar')
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
  )
}

// Componente placeholder para horarios
const ScheduleSettings = () => {
  return (
    <div className="text-center py-8">
      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Horarios</h3>
      <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
    </div>
  )
}

// Componente placeholder para planes
const MembershipPlansSettings = () => {
  return (
    <div className="text-center py-8">
      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Planes de Membresía</h3>
      <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
    </div>
  )
}

export default SettingsPage