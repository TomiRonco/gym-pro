import React, { useState, useEffect } from 'react'
import { Users, Search, Plus, Edit, Trash2, UserCheck, UserX, X, Calendar, Phone, Mail, MapPin, User, CreditCard, Save } from 'lucide-react'
import { authenticatedFetch } from '../config/api'
import { useNotification } from '../context/NotificationContext'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { success, error } = useNotification()

  // Estado del formulario
  const [formData, setFormData] = useState({
    membership_number: '',
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
    membership_start_date: '',
    membership_end_date: '',
    trainer_id: '',
    notes: ''
  })

  // Cargar miembros
  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        // Sin datos simulados - base de datos limpia
        setMembers([])
      }
    } catch (error) {
      console.error('Error cargando miembros:', error)
      // Base de datos limpia en caso de error
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Filtrar miembros (ahora incluye DNI)
  const filteredMembers = members.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membership_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      membership_number: '', // Se auto-generará en el backend
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
      membership_start_date: '',
      membership_end_date: '',
      trainer_id: '',
      notes: ''
    })
  }

  // Abrir modal para nuevo miembro
  const handleAddMember = () => {
    resetForm()
    setEditingMember(null)
    setShowModal(true)
  }

  // Abrir modal para editar miembro
  const handleEditMember = (member) => {
    setFormData({
      membership_number: member.membership_number || '',
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      dni: member.dni || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      birth_date: member.birth_date || '',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || '',
      membership_type: member.membership_type || 'monthly',
      membership_start_date: member.membership_start_date || '',
      membership_end_date: member.membership_end_date || '',
      trainer_id: member.trainer_id || '',
      notes: member.notes || ''
    })
    setEditingMember(member)
    setShowModal(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMember(null)
    resetForm()
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Crear/actualizar miembro
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingMember ? `/members/${editingMember.id}` : '/members'
      const method = editingMember ? 'PUT' : 'POST'

      // Para nuevos socios, no enviar membership_number para que se auto-genere
      const dataToSend = { ...formData }
      if (!editingMember) {
        delete dataToSend.membership_number // Eliminar para auto-generación
      }

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        success(editingMember ? 'Socio actualizado correctamente' : 'Socio creado correctamente')
        handleCloseModal()
        loadMembers()
      } else {
        const errorData = await response.json()
        error(errorData.detail || 'Error al guardar el socio')
      }
    } catch (err) {
      error('Error al conectar con el servidor')
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar miembro
  const handleDeleteMember = async (member) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${member.first_name} ${member.last_name}?`)) {
      return
    }

    try {
      const response = await authenticatedFetch(`/members/${member.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        success('Socio eliminado correctamente')
        loadMembers()
      } else {
        error('Error al eliminar el socio')
      }
    } catch (err) {
      error('Error al conectar con el servidor')
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (status) => {
    return status === 'active' ? 'Activo' : 'Inactivo'
  }

  const getMembershipTypeText = (type) => {
    const types = {
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return types[type] || type
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Socios</h1>
          <p className="mt-2 text-gray-600">Gestiona la información de los miembros del gimnasio</p>
        </div>
        <button
          onClick={handleAddMember}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Socio</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar socios por nombre, email, DNI o número de socio..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Socios</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Socios Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Socios Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => !m.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Socios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Socios</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando socios...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay socios registrados</h3>
            <p className="text-gray-600">Comienza agregando el primer socio al gimnasio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
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
                    Vencimiento
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.membership_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.dni || 'Sin DNI'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getMembershipTypeText(member.membership_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Desde: {new Date(member.membership_start_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.is_active ? 'active' : 'inactive')}`}>
                        {getStatusText(member.is_active ? 'active' : 'inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(member.membership_end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar socio"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar socio"
                        >
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

      {/* Modal para Agregar/Editar Socio */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMember ? 'Editar Socio' : 'Nuevo Socio'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Información Personal
                  </h3>
                  
                  {/* Número de socio automático - no mostrar campo */}
                  {editingMember && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Número de Socio:</strong> {editingMember.membership_number}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        El número de socio se genera automáticamente y no se puede modificar
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345678"
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

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contacto
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Membresía */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Membresía
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
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
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
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        name="membership_end_date"
                        value={formData.membership_end_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID del Entrenador (opcional)
                      </label>
                      <input
                        type="number"
                        name="trainer_id"
                        value={formData.trainer_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ID del entrenador asignado"
                      />
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
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{editingMember ? 'Actualizar' : 'Crear'} Socio</span>
                    </>
                  )}
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