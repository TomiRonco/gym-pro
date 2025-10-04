import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react'
import { authenticatedFetch } from '../config/api'
import { useNotification } from '../context/NotificationContext'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { success, error } = useNotification()
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

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

      // Base de datos limpia - sin pagos simulados
      setPayments([])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Abrir modal
  const openModal = () => {
    setFormData({
      member_id: '',
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setIsModalOpen(true)
  }

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const selectedMember = members.find(m => m.id === parseInt(formData.member_id))
    if (!selectedMember) {
      error('Selecciona un socio válido', 'Error de validación')
      return
    }

    // Simular guardado
    const newPayment = {
      id: Date.now(),
      member: selectedMember,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      notes: formData.notes
    }

    setPayments(prev => [newPayment, ...prev])
    success('Pago registrado exitosamente', 'Pago completado')
    closeModal()
  }

  const PaymentMethodIcon = ({ method }) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-green-600" />
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'transfer':
        return <DollarSign className="w-4 h-4 text-purple-600" />
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  const getMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'card':
        return 'Tarjeta'
      case 'transfer':
        return 'Transferencia'
      default:
        return method
    }
  }

  const getMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800'
      case 'card':
        return 'bg-blue-100 text-blue-800'
      case 'transfer':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filtrar pagos
  const filteredPayments = payments.filter(payment =>
    payment.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.member.membership_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-gray-600">Gestiona los pagos de las membresías</p>
        </div>
        <button
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
          disabled
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de socio..."
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
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Recibidos</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio por Pago</p>
              <p className="text-2xl font-bold text-gray-900">
                ${payments.length > 0 ? (payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Pagos</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando pagos...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-600">Comienza registrando el primer pago</p>
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
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.member.first_name} {payment.member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.member.membership_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PaymentMethodIcon method={payment.payment_method} />
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.payment_method)}`}>
                          {getMethodText(payment.payment_method)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {payment.notes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payments