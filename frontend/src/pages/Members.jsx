import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText
} from 'lucide-react'
import { membersService } from '../services/api'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    membership_type: 'monthly',
    membership_start_date: new Date().toISOString().split('T')[0],
    membership_end_date: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Opciones de membresía
  const membershipTypes = [
    { value: 'daily', label: 'Pase Diario' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'annual', label: 'Anual' }
  ]

  // Cargar miembros
  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await membersService.getMembers()
      setMembers(response || [])
    } catch (error) {
      console.error('Error loading members:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  // Calcular fecha de fin de membresía automáticamente
  useEffect(() => {
    if (formData.membership_start_date && formData.membership_type) {
      const startDate = new Date(formData.membership_start_date)
      let endDate = new Date(startDate)

      switch (formData.membership_type) {
        case 'daily':
          endDate.setDate(startDate.getDate() + 1)
          break
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case 'quarterly':
          endDate.setMonth(startDate.getMonth() + 3)
          break
        case 'annual':
          endDate.setFullYear(startDate.getFullYear() + 1)
          break
        default:
          endDate.setMonth(startDate.getMonth() + 1)
      }

      setFormData(prev => ({
        ...prev,
        membership_end_date: endDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.membership_start_date, formData.membership_type])

  useEffect(() => {
    loadMembers()
  }, [])

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}

    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es requerido'
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido'
    }

    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido'
    } else if (!/^\d{7,8}$/.test(formData.dni)) {
      errors.dni = 'El DNI debe tener 7 u 8 dígitos'
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido'
    }

    if (!formData.membership_start_date) {
      errors.membership_start_date = 'La fecha de inicio es requerida'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await membersService.createMember(formData)
      
      // Resetear formulario
      setFormData({
        first_name: '',
        last_name: '',
        dni: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        membership_type: 'monthly',
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_end_date: '',
        notes: ''
      })
      
      setShowModal(false)
      setFormErrors({})
      await loadMembers()
      
    } catch (error) {
      console.error('Error creating member:', error)
      // Manejar errores específicos del backend
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('Email already registered')) {
          setFormErrors({ email: 'Este email ya está registrado' })
        } else if (error.response.data.detail.includes('DNI already exists')) {
          setFormErrors({ dni: 'Este DNI ya está registrado' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Filtrar miembros
  const filteredMembers = members.filter(member =>
    member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membership_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600">Gestiona los socios del gimnasio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Socio</span>
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o número de socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de socios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando socios...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron socios' : 'No hay socios registrados'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer socio'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Agregar Primer Socio</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membresía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.membership_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {membershipTypes.find(type => type.value === member.membership_type)?.label || member.membership_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        Vence: {new Date(member.membership_end_date).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de nuevo socio */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Socio</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Información Personal
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el nombre"
                    />
                    {formErrors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el apellido"
                    />
                    {formErrors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI *
                    </label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.dni ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678"
                      maxLength="8"
                    />
                    {formErrors.dni && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.dni}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Información de Contacto
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ejemplo@email.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="11-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle Falsa 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del contacto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="11-9876-5432"
                    />
                  </div>
                </div>

                {/* Información de Membresía */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Información de Membresía
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Membresía *
                      </label>
                      <select
                        name="membership_type"
                        value={formData.membership_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {membershipTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Inicio *
                      </label>
                      <input
                        type="date"
                        name="membership_start_date"
                        value={formData.membership_start_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.membership_start_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.membership_start_date && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.membership_start_date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        name="membership_end_date"
                        value={formData.membership_end_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Información adicional sobre el socio..."
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{loading ? 'Guardando...' : 'Guardar Socio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Members