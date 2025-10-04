import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  Filter,
  Search
} from 'lucide-react'
import { membershipService } from '../services/membershipService'
import { useNotification } from '../context/NotificationContext'
import { useSimpleConfirm } from '../hooks/useConfirm'

const MembershipPlans = () => {
  const [plans, setPlans] = useState([])
  const [filteredPlans, setFilteredPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const { success, error } = useNotification()
  const { confirm, ConfirmDialog } = useSimpleConfirm()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    plan_type: 'monthly',
    max_visits_per_month: '',
    features: '',
    is_active: true
  })

  const planTypes = [
    { value: 'daily', label: 'Diario', days: 1 },
    { value: 'weekly', label: 'Semanal', days: 7 },
    { value: 'monthly', label: 'Mensual', days: 30 },
    { value: 'quarterly', label: 'Trimestral', days: 90 },
    { value: 'annual', label: 'Anual', days: 365 }
  ]

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = showInactive ? await membershipService.getAllPlans() : await membershipService.getPlans()
      setPlans(data)
    } catch {
      error('Error al Cargar', 'No se pudieron cargar los planes de membresía')
    } finally {
      setLoading(false)
    }
  }

  const filterPlans = () => {
    let filtered = plans

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(plan => plan.plan_type === filterType)
    }

    setFilteredPlans(filtered)
  }

  useEffect(() => {
    loadPlans()
  }, [showInactive]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterPlans()
  }, [plans, searchTerm, filterType]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_days: '',
      plan_type: 'monthly',
      max_visits_per_month: '',
      features: '',
      is_active: true
    })
    setEditingPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Preparar datos
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        max_visits_per_month: formData.max_visits_per_month ? parseInt(formData.max_visits_per_month) : null
      }

      if (editingPlan) {
        await membershipService.updatePlan(editingPlan.id, planData)
        success('Plan Actualizado', 'El plan de membresía ha sido actualizado exitosamente')
      } else {
        await membershipService.createPlan(planData)
        success('Plan Creado', 'El plan de membresía ha sido creado exitosamente')
      }

      await loadPlans()
      setShowModal(false)
      resetForm()
    } catch (err) {
      const action = editingPlan ? 'actualizar' : 'crear'
      error('Error de Validación', err.message || `No se pudo ${action} el plan. Verifique los datos ingresados`)
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
      duration_days: plan.duration_days.toString(),
      plan_type: plan.plan_type,
      max_visits_per_month: plan.max_visits_per_month?.toString() || '',
      features: plan.features || '',
      is_active: plan.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (planId) => {
    const planToDelete = plans.find(p => p.id === planId)
    if (!planToDelete) return

    const confirmed = await confirm({
      title: 'Eliminar Plan',
      message: `¿Estás seguro de que deseas eliminar "${planToDelete.name}"? Este plan será desactivado y ya no estará disponible para nuevas membresías.`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (confirmed) {
      try {
        setLoading(true)
        await membershipService.deletePlan(planId)
        await loadPlans()
        success('Plan Eliminado', `"${planToDelete.name}" ha sido eliminado del sistema`)
      } catch (err) {
        error('Error al Eliminar', `No se pudo eliminar "${planToDelete.name}". Intente nuevamente`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-calcular días según el tipo de plan
    if (field === 'plan_type') {
      const planType = planTypes.find(pt => pt.value === value)
      if (planType) {
        setFormData(prev => ({ ...prev, duration_days: planType.days.toString() }))
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const getPlanTypeLabel = (type) => {
    const planType = planTypes.find(pt => pt.value === type)
    return planType ? planType.label : type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="w-8 h-8 text-yellow-500 mr-3" />
              Planes de Membresía
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona los planes y precios de las membresías del gimnasio
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Plus size={20} className="mr-2" />
              Nuevo Plan
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar planes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por tipo */}
          <div className="lg:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              {planTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Toggle inactivos */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar inactivos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : filteredPlans.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes disponibles</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron planes con los filtros aplicados'
                : 'Comienza creando tu primer plan de membresía'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Primer Plan
              </button>
            )}
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-lg shadow-sm border ${plan.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'} p-6 relative`}>
              {/* Estado */}
              <div className="absolute top-4 right-4">
                {plan.is_active ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Contenido */}
              <div className="pr-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                {plan.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Precio */}
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {formatPrice(plan.price)}
                </div>

                {/* Detalles */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {plan.duration_days} días ({getPlanTypeLabel(plan.plan_type)})
                  </div>
                  
                  {plan.max_visits_per_month && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {plan.max_visits_per_month} visitas/mes
                    </div>
                  )}
                </div>

                {/* Características */}
                {plan.features && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Características:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{plan.features}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Edit3 size={16} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  placeholder="Descripción del plan..."
                />
              </div>

              {/* Tipo y Duración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Plan *
                  </label>
                  <select
                    required
                    value={formData.plan_type}
                    onChange={(e) => handleInputChange('plan_type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {planTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (días) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Precio y Visitas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitas por mes (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_visits_per_month}
                    onChange={(e) => handleInputChange('max_visits_per_month', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ilimitado"
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

export default MembershipPlans