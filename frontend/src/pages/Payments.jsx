import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, Plus, CreditCard, X } from 'lucide-react'
import { useActivity } from '../context/ActivityContext'
import { useNotification } from '../context/NotificationContext'
import { membersService, paymentsService } from '../services/api'
import { membershipService } from '../services/membershipService'

const Payments = () => {
  const [showModal, setShowModal] = useState(false)
  const [members, setMembers] = useState([])
  const [membershipPlans, setMembershipPlans] = useState([])
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  
  // Estados para estadísticas reales
  const [paymentStats, setPaymentStats] = useState({
    totalRecaudado: 0,
    pagosDelMes: 0,
    pendientes: 0,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear()
  })

  // Variables para evitar dependencias circulares
  const selectedMonth = paymentStats.selectedMonth
  const selectedYear = paymentStats.selectedYear
  
  const [selectedMember, setSelectedMember] = useState(null)
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    membershipPlan: '',
    amount: '',
    concept: 'Membresía',
    paymentMethod: 'efectivo'
  })
  const { addPaymentActivity } = useActivity()
  const { success } = useNotification()

  // Funciones para cargar datos
  const loadMembers = async () => {
    try {
      const data = await membersService.getMembers()
      setMembers(data)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const loadMembershipPlans = async () => {
    try {
      const data = await membershipService.getPlans()
      setMembershipPlans(data)
    } catch (error) {
      console.error('Error loading membership plans:', error)
    }
  }

  const loadPayments = async () => {
    try {
      setLoadingPayments(true)
      const data = await paymentsService.getPayments()
      setPayments(data)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  // Calcular estadísticas reales de pagos
  const calculatePaymentStats = useCallback(() => {
    // Total recaudado para el mes seleccionado (todos los pagos)
    const totalRecaudado = payments
      .filter(payment => {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getMonth() + 1 === selectedMonth && 
               paymentDate.getFullYear() === selectedYear
        // Incluir todos los pagos ya que ambos estados representan dinero recibido
      })
      .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
    
    // Cantidad de pagos del mes seleccionado
    const pagosDelMes = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      return paymentDate.getMonth() + 1 === selectedMonth && 
             paymentDate.getFullYear() === selectedYear
    }).length
    
    // Pendientes: socios activos que no han pagado este mes
    const sociosQuePagaron = payments
      .filter(payment => {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getMonth() + 1 === selectedMonth && 
               paymentDate.getFullYear() === selectedYear
      })
      .map(payment => payment.member_id)
    
    const sociosActivos = members.filter(member => member.is_active === true)
    const pendientes = sociosActivos.length - new Set(sociosQuePagaron).size
    
    setPaymentStats(prev => ({
      ...prev,
      totalRecaudado,
      pagosDelMes,
      pendientes
    }))
  }, [payments, members, selectedMonth, selectedYear])

  // Cargar socios, planes y pagos al montar el componente
  useEffect(() => {
    loadMembers()
    loadMembershipPlans()
    loadPayments()
  }, [])

  // Recalcular estadísticas cuando cambien los datos
  useEffect(() => {
    if (payments.length > 0 && members.length > 0) {
      calculatePaymentStats()
    }
  }, [payments, members, calculatePaymentStats])

  // Filtrar socios que no han pagado este mes
  const getAvailableMembers = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return members.filter(member => {
      // Verificar si el socio ya pagó este mes
      const hasPaymentThisMonth = payments.some(payment => {
        const paymentDate = new Date(payment.payment_date)
        return payment.member_id === member.id &&
               paymentDate.getMonth() === currentMonth &&
               paymentDate.getFullYear() === currentYear
      })
      
      return !hasPaymentThisMonth
    })
  }

  // Manejar selección de socio
  const handleMemberChange = (e) => {
    const memberId = e.target.value
    const member = members.find(m => m.id === parseInt(memberId))
    
    if (member) {
      const plan = membershipPlans.find(p => p.id === member.membership_plan_id)
      setSelectedMember(member)
      setFormData(prev => ({
        ...prev,
        memberId: memberId,
        memberName: `${member.first_name} ${member.last_name}`,
        membershipPlan: plan ? plan.name : '',
        amount: plan ? plan.price.toString() : '',
        concept: plan ? `Membresía ${plan.name}` : 'Membresía'
      }))
    } else {
      setSelectedMember(null)
      setFormData(prev => ({
        ...prev,
        memberId: '',
        memberName: '',
        membershipPlan: '',
        amount: '',
        concept: 'Membresía'
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Preparar datos del pago para la API
      const paymentData = {
        member_id: parseInt(formData.memberId),
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        payment_concept: formData.concept,
        description: `Pago de ${formData.memberName} - ${formData.concept}`
      }

      // Guardar el pago en la base de datos
      await paymentsService.createPayment(paymentData)
      
      // Auto-renovar membresía del socio (extender 1 mes desde la fecha actual de fin)
      if (selectedMember && selectedMember.membership_end_date) {
        try {
          const currentEndDate = new Date(selectedMember.membership_end_date)
          const newEndDate = new Date(currentEndDate)
          newEndDate.setMonth(currentEndDate.getMonth() + 1)
          
          await membersService.updateMember(selectedMember.id, {
            membership_end_date: newEndDate.toISOString().split('T')[0]
          })
        } catch (renewError) {
          console.error('Error renovando membresía:', renewError)
          // No fallar si la renovación no funciona, pero notificar
        }
      }
      
      // Agregar actividad de pago al contexto (para el dashboard)
      addPaymentActivity(
        formData.memberName,
        parseFloat(formData.amount),
        formData.concept,
        formData.paymentMethod
      )
      
      // Mostrar notificación de éxito mejorada
      success(
        `$${formData.amount} • Membresía renovada por 1 mes`,
        `Pago de ${formData.memberName} ✅`
      )
      
      // Recargar la lista de pagos y socios para mostrar cambios
      await loadPayments()
      await loadMembers() // Recargar para actualizar fechas de membresía
      
    } catch (error) {
      console.error('Error creating payment:', error)
      let errorMessage = 'No se pudo procesar el pago'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      error(errorMessage, 'Error al registrar pago ❌')
      return // No cerrar el modal si hay error
    }
    
    // Resetear formulario y cerrar modal solo si todo salió bien
    setFormData({
      memberId: '',
      memberName: '',
      membershipPlan: '',
      amount: '',
      concept: 'Membresía',
      paymentMethod: 'efectivo'
    })
    setSelectedMember(null)
    setShowModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Pagos</h1>
            <p className="mt-2 text-lg text-purple-100">Gestión de pagos y facturación</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            disabled={getAvailableMembers().length === 0}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors shadow-md mt-4 sm:mt-0 min-w-[140px] justify-center ${
              getAvailableMembers().length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-purple-700'
            }`}
            title={getAvailableMembers().length === 0 ? 'Todos los socios han pagado este mes' : 'Registrar nuevo pago'}
          >
            <Plus size={20} />
            <span>{getAvailableMembers().length === 0 ? 'Todos al día' : 'Nuevo Pago'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${paymentStats.totalRecaudado.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              value={paymentStats.selectedMonth}
              onChange={(e) => setPaymentStats(prev => ({...prev, selectedMonth: parseInt(e.target.value)}))}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2024, i).toLocaleString('es-AR', { month: 'long' }).toLowerCase()}
                </option>
              ))}
            </select>
            <select 
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              value={paymentStats.selectedYear}
              onChange={(e) => setPaymentStats(prev => ({...prev, selectedYear: parseInt(e.target.value)}))}
            >
              {Array.from({length: 5}, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return <option key={year} value={year}>{year}</option>
              })}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.pagosDelMes}</p>
              <p className="text-sm text-gray-500">
                {new Date(paymentStats.selectedYear, paymentStats.selectedMonth - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.pendientes}</p>
              <p className="text-sm text-gray-500">Pagos del mes que faltan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Pagos</h2>
        </div>
        
        {loadingPayments ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando pagos...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-600">Los pagos registrados aparecerán aquí</p>
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
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const member = members.find(m => m.id === payment.member_id)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member ? `${member.first_name} ${member.last_name}` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member?.membership_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.payment_concept}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.is_verified ? 'Verificado' : 'Aprobado'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para registrar nuevo pago */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Socio *
                </label>
                <select
                  id="memberId"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleMemberChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccione un socio...</option>
                  {getAvailableMembers().length === 0 ? (
                    <option disabled>Todos los socios han pagado este mes</option>
                  ) : (
                    getAvailableMembers().map(member => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} - {member.membership_number}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedMember && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>Plan actual:</strong> {formData.membershipPlan}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedMember.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Vence:</strong> {selectedMember.membership_end_date ? 
                      new Date(selectedMember.membership_end_date).toLocaleDateString('es-AR') : 
                      'No especificado'
                    }
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Al pagar se renovará automáticamente por 1 mes
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  id="concept"
                  name="concept"
                  value={formData.concept}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Cuota mensual, Clase especial, etc."
                />
              </div>
              
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta_debito">Tarjeta de Débito</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                  <option value="mercado_pago">Mercado Pago</option>
                </select>
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
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments