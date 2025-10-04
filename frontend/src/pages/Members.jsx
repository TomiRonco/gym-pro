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
  FileText,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { membersService } from '../services/api'
import { membershipService } from '../services/membershipService'
import { useNotification } from '../context/NotificationContext'
import { useActivity } from '../context/ActivityContext'

// Componente para el modal de edición
const MemberEditModal = ({ member, onClose, onSave, membershipTypes }) => {
  const { error } = useNotification()
  const [formData, setFormData] = useState({
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    dni: member.dni || '',
    email: member.email || '',
    phone: member.phone || '',
    address: member.address || '',
    birth_date: member.birth_date || '',
    emergency_contact_name: member.emergency_contact_name || '',
    emergency_contact_phone: member.emergency_contact_phone || '',
    membership_plan_id: member.membership_plan_id || member.membership_type || (membershipTypes.length > 0 ? membershipTypes[0].value : null),
    membership_start_date: member.membership_start_date || '',
    membership_end_date: member.membership_end_date || '',
    notes: member.notes || ''
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)

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

  // Calcular fecha de fin de membresía automáticamente (siempre 1 mes)
  useEffect(() => {
    if (formData.membership_start_date && formData.membership_plan_id) {
      const startDate = new Date(formData.membership_start_date)
      const endDate = new Date(startDate)
      
      // Todos los planes tienen vencimiento a 1 mes
      endDate.setMonth(startDate.getMonth() + 1)

      setFormData(prev => ({
        ...prev,
        membership_end_date: endDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.membership_start_date, formData.membership_plan_id])

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
      await onSave(formData)
    } catch (err) {
      console.error('Error updating member:', err)
      if (err.response?.data?.detail) {
        if (err.response.data.detail.includes('Email already registered')) {
          setFormErrors({ email: 'Este email ya está registrado' })
        } else if (err.response.data.detail.includes('DNI already exists')) {
          setFormErrors({ dni: 'Este DNI ya está registrado' })
        } else {
          error('Error al editar socio', err.response.data.detail)
        }
      } else {
        error('Error al editar socio', 'Verifique los datos e intente nuevamente')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Editar Socio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del socio"
                  />
                  {formErrors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Apellido del socio"
                  />
                  {formErrors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.dni ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345678"
                  />
                  {formErrors.dni && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.dni}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@ejemplo.com"
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
                    placeholder="+54 11 1234-5678"
                  />
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Calle 123, Ciudad, Provincia"
                />
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono del Contacto
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>
            </div>

            {/* Información de Membresía */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Membresía</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan de Membresía
                  </label>
                  <select
                    name="membership_plan_id"
                    value={formData.membership_plan_id}
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
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="membership_start_date"
                    value={formData.membership_start_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.membership_start_date ? 'border-red-300' : 'border-gray-300'
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

              <div className="mt-4">
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
              onClick={onClose}
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
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Members = () => {
  // Función utilitaria para manejar fechas sin problemas de zona horaria
  const parseLocalDate = (dateString) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-')
    return new Date(year, month - 1, day)
  }

  const [members, setMembers] = useState([])
  const [membershipPlans, setMembershipPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    membershipPlan: 'all', // all, specific plan id
    membershipStatus: 'all' // all, vigente, vencida
  })
  const { success, error } = useNotification()
  const { addMemberActivity } = useActivity()
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
    membership_plan_id: null,
    membership_start_date: new Date().toISOString().split('T')[0],
    membership_end_date: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Cargar planes de membresía
  const loadMembershipPlans = async () => {
    try {
      const plans = await membershipService.getPlans()
      setMembershipPlans(plans)
      // Si no hay plan seleccionado y hay planes disponibles, seleccionar el primero
      if (!formData.membership_plan_id && plans.length > 0) {
        setFormData(prev => ({ ...prev, membership_plan_id: plans[0].id }))
      }
    } catch {
      error('Error al Cargar', 'No se pudieron cargar los planes de membresía')
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadMembers()
    loadMembershipPlans()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Obtener opciones de membresía de los planes cargados
  const membershipTypes = membershipPlans.map(plan => ({
    value: plan.id,
    label: plan.name,
    id: plan.id,
    price: plan.price,
    days_per_week: plan.days_per_week
  }))

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

  // Calcular fecha de fin de membresía automáticamente (siempre 1 mes)
  useEffect(() => {
    if (formData.membership_start_date && formData.membership_plan_id) {
      const startDate = new Date(formData.membership_start_date)
      const endDate = new Date(startDate)
      
      // Todos los planes tienen vencimiento a 1 mes
      endDate.setMonth(startDate.getMonth() + 1)

      setFormData(prev => ({
        ...prev,
        membership_end_date: endDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.membership_start_date, formData.membership_plan_id])

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
        membership_plan_id: membershipPlans.length > 0 ? membershipPlans[0].id : null,
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_end_date: '',
        notes: ''
      })
      
      setShowModal(false)
      setFormErrors({})
      await loadMembers()
      
      // Registrar actividad de nuevo socio
      addMemberActivity(`${formData.first_name} ${formData.last_name}`)
      
      success('Socio Creado', 'El nuevo socio ha sido registrado correctamente')
      
    } catch (err) {
      console.error('Error creating member:', err)
      // Manejar errores específicos del backend
      if (err.response?.data?.detail) {
        if (err.response.data.detail.includes('Email already registered')) {
          setFormErrors({ email: 'Este email ya está registrado' })
        } else if (err.response.data.detail.includes('DNI already exists')) {
          setFormErrors({ dni: 'Este DNI ya está registrado' })
        } else {
          error('Error al Crear', err.response.data.detail)
        }
      } else {
        error('Error al Crear', 'Verifique los datos e intente nuevamente')
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para ver detalles del socio
  const handleViewMember = async (member) => {
    try {
      // Obtener los datos más recientes del miembro
      const freshMemberData = await membersService.getMember(member.id)
      setSelectedMember(freshMemberData)
      setShowViewModal(true)
    } catch (err) {
      console.error('Error loading fresh member data:', err)
      // Si hay error, usar los datos que ya tenemos
      setSelectedMember(member)
      setShowViewModal(true)
    }
  }

  // Función para editar socio
  const handleEditMember = (member) => {
    setEditingMember(member)
    setShowEditModal(true)
  }

  // Función para actualizar socio
  const handleUpdateMember = async (memberData) => {
    try {
      const updatedMember = await membersService.updateMember(editingMember.id, memberData)
      
      setMembers(prev => prev.map(member => 
        member.id === editingMember.id ? updatedMember : member
      ))
      
      // Actualizar selectedMember si es el mismo que se está editando
      if (selectedMember && selectedMember.id === editingMember.id) {
        setSelectedMember(updatedMember)
      }
      
      setShowEditModal(false)
      setEditingMember(null)
      success('Socio Actualizado', 'Los cambios se han guardado correctamente')
    } catch (err) {
      console.error('Error al actualizar miembro:', err)
      error('Error al Actualizar', err.message || 'No se pudieron actualizar los datos del socio')
    }
  }

  // Función para activar/desactivar socio
  const handleToggleStatus = async (member) => {
    try {
      const updatedMember = await membersService.updateMember(member.id, {
        ...member,
        is_active: !member.is_active
      })
      
      setMembers(prev => prev.map(m => 
        m.id === member.id ? updatedMember : m
      ))
      
      // Actualizar selectedMember si es el mismo que se está cambiando de estado
      if (selectedMember && selectedMember.id === member.id) {
        setSelectedMember(updatedMember)
      }
      
      const statusText = updatedMember.is_active ? 'activado' : 'desactivado'
      success(`Socio ${statusText} exitosamente`, `El estado del socio se ha actualizado correctamente`)
    } catch (err) {
      console.error('Error al cambiar estado del miembro:', err)
      error(`Error al cambiar estado del socio: ${err.message || 'Error desconocido'}`, 'Intente nuevamente en unos momentos')
    }
  }

  // Filtrar miembros
  const filteredMembers = members.filter(member => {
    // Filtro de búsqueda de texto
    const matchesSearch = !searchTerm || 
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership_number?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de estado del socio
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && member.is_active) ||
      (filters.status === 'inactive' && !member.is_active)

    // Filtro de plan de membresía
    const matchesPlan = filters.membershipPlan === 'all' || 
      member.membership_plan_id === parseInt(filters.membershipPlan) ||
      member.membership_type === parseInt(filters.membershipPlan) ||
      member.membership_plan_id === filters.membershipPlan ||
      member.membership_type === filters.membershipPlan

    // Filtro de estado de membresía (vigente/vencida)
    const matchesMembershipStatus = filters.membershipStatus === 'all' || (() => {
      if (!member.membership_end_date) return filters.membershipStatus === 'all'
      const endDate = parseLocalDate(member.membership_end_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isActive = endDate >= today
      return (filters.membershipStatus === 'vigente' && isActive) ||
             (filters.membershipStatus === 'vencida' && !isActive)
    })()

    return matchesSearch && matchesStatus && matchesPlan && matchesMembershipStatus
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Socios</h1>
            <p className="mt-2 text-lg text-green-100">Gestiona los socios del gimnasio</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-gray-50 text-green-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-semibold shadow-md min-w-[140px] justify-center"
          >
            <Plus size={20} />
            <span>Nuevo Socio</span>
          </button>
        </div>
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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              <span>Filtros</span>
              {(filters.status !== 'all' || filters.membershipPlan !== 'all' || filters.membershipStatus !== 'all') && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-2 h-2"></span>
              )}
            </button>
          </div>
          
          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por estado del socio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del Socio
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                {/* Filtro por plan de membresía */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan de Membresía
                  </label>
                  <select
                    value={filters.membershipPlan}
                    onChange={(e) => setFilters(prev => ({ ...prev, membershipPlan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos los planes</option>
                    {membershipTypes.map(plan => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por estado de membresía */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Membresía
                  </label>
                  <select
                    value={filters.membershipStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, membershipStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    <option value="vigente">Vigentes</option>
                    <option value="vencida">Vencidas</option>
                  </select>
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({
                    status: 'all',
                    membershipPlan: 'all',
                    membershipStatus: 'all'
                  })}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de socios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header con contador de resultados */}
        {!loading && members.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <p className="text-sm text-gray-600">
              Mostrando {filteredMembers.length} de {members.length} socios
              {(searchTerm || filters.status !== 'all' || filters.membershipPlan !== 'all' || filters.membershipStatus !== 'all') && (
                <span className="text-blue-600 ml-1">(filtrados)</span>
              )}
            </p>
          </div>
        )}
        
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
                        {membershipTypes.find(type => type.value === member.membership_plan_id)?.label || 
                         membershipTypes.find(type => type.value === member.membership_type)?.label || 
                         'Plan no encontrado'}
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
                        <button 
                          onClick={() => handleViewMember(member)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditMember(member)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Editar socio"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(member)}
                          className={`p-1 rounded transition-colors ${
                            member.is_active 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={member.is_active ? 'Desactivar socio' : 'Activar socio'}
                        >
                          {member.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
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
                        Plan de Membresía *
                      </label>
                      <select
                        name="membership_plan_id"
                        value={formData.membership_plan_id}
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

      {/* Modal de ver detalles del socio */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Detalles del Socio</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Personal</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-gray-900">{selectedMember.first_name} {selectedMember.last_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">DNI</label>
                    <p className="text-gray-900">{selectedMember.dni}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{selectedMember.phone || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <p className="text-gray-900">{selectedMember.address || 'No especificada'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                    <p className="text-gray-900">
                      {selectedMember.birth_date ? (
                        <>
                          {parseLocalDate(selectedMember.birth_date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                          <span className="text-sm text-gray-500 ml-2">
                            ({(() => {
                              const birthDate = parseLocalDate(selectedMember.birth_date)
                              const today = new Date()
                              const age = today.getFullYear() - birthDate.getFullYear()
                              const monthDiff = today.getMonth() - birthDate.getMonth()
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                return age - 1
                              }
                              return age
                            })()} años)
                          </span>
                        </>
                      ) : 'No especificada'}
                    </p>
                  </div>
                </div>

                {/* Información de Membresía */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información de Membresía</h3>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMember.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedMember.is_active ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Socio</label>
                    <p className="text-gray-900">{selectedMember.membership_number || 'No asignado'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan de Membresía</label>
                    <p className="text-gray-900">
                      {membershipTypes.find(type => type.value === selectedMember.membership_plan_id)?.label || 
                       membershipTypes.find(type => type.value === selectedMember.membership_type)?.label || 
                       'Plan no encontrado'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Días por Semana</label>
                    <p className="text-gray-900">
                      {membershipTypes.find(type => type.value === selectedMember.membership_plan_id)?.days_per_week || 
                       membershipTypes.find(type => type.value === selectedMember.membership_type)?.days_per_week || 
                       'No especificado'} días
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Precio del Plan</label>
                    <p className="text-gray-900">
                      ${membershipTypes.find(type => type.value === selectedMember.membership_plan_id)?.price || 
                        membershipTypes.find(type => type.value === selectedMember.membership_type)?.price || 
                        'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                    <p className="text-gray-900">
                      {selectedMember.membership_start_date ? (() => {
                        const [year, month, day] = selectedMember.membership_start_date.split('-')
                        const localDate = new Date(year, month - 1, day)
                        return localDate.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      })() : 'No especificada'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Vencimiento</label>
                    <p className="text-gray-900">
                      {selectedMember.membership_end_date ? (
                        <>
                          {(() => {
                            const [year, month, day] = selectedMember.membership_end_date.split('-')
                            const localDate = new Date(year, month - 1, day)
                            return localDate.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })
                          })()}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            (() => {
                              const [year, month, day] = selectedMember.membership_end_date.split('-')
                              const endDate = new Date(year, month - 1, day)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0) // Comparar solo fechas, no horas
                              return endDate >= today
                            })()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(() => {
                              const [year, month, day] = selectedMember.membership_end_date.split('-')
                              const endDate = new Date(year, month - 1, day)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return endDate >= today ? 'Vigente' : 'Vencida'
                            })()}
                          </span>
                        </>
                      ) : 'No especificada'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Tiempo de Membresía</label>
                    <p className="text-gray-900">
                      {selectedMember.membership_start_date ? (
                        <>
                          {(() => {
                            const [year, month, day] = selectedMember.membership_start_date.split('-')
                            const startDate = new Date(year, month - 1, day)
                            const today = new Date()
                            const diffTime = today - startDate
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                            const months = Math.floor(diffDays / 30.44)
                            return months
                          })()} meses
                          <span className="text-sm text-gray-500 ml-1">
                            (desde {(() => {
                              const [year, month, day] = selectedMember.membership_start_date.split('-')
                              const localDate = new Date(year, month - 1, day)
                              return localDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                            })()})
                          </span>
                        </>
                      ) : 'No calculable'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="text-gray-900">
                      {selectedMember.created_at ? (() => {
                        // Para created_at usamos Date normal ya que incluye tiempo
                        const date = new Date(selectedMember.created_at)
                        return date.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      })() : 'No disponible'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Contacto de Emergencia</label>
                    <div className="text-gray-900">
                      {selectedMember.emergency_contact_name ? (
                        <div className="space-y-1">
                          <p className="font-medium">{selectedMember.emergency_contact_name}</p>
                          {selectedMember.emergency_contact_phone && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone size={14} className="mr-1" />
                              {selectedMember.emergency_contact_phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No especificado</p>
                      )}
                    </div>
                  </div>

                  {selectedMember.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notas</label>
                      <p className="text-gray-900">{selectedMember.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditMember(selectedMember)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit size={16} />
                  <span>Editar Socio</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar socio */}
      {showEditModal && editingMember && (
        <MemberEditModal
          member={editingMember}
          onClose={() => {
            setShowEditModal(false)
            setEditingMember(null)
          }}
          onSave={handleUpdateMember}
          membershipTypes={membershipTypes}
        />
      )}
    </div>
  )
}

export default Members