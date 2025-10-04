import React, { createContext, useContext, useState } from 'react'

const ActivityContext = createContext()

export const useActivity = () => {
  const context = useContext(ActivityContext)
  if (!context) {
    throw new Error('useActivity debe ser usado dentro de ActivityProvider')
  }
  return context
}

export const ActivityProvider = ({ children }) => {
  const [recentActivity, setRecentActivity] = useState([])

  // Función para agregar nueva actividad
  const addActivity = (type, member, description, additionalData = {}) => {
    const newActivity = {
      id: Date.now() + Math.random(), // ID único
      type,
      member,
      description,
      timestamp: new Date(),
      ...additionalData
    }

    setRecentActivity(prev => [newActivity, ...prev.slice(0, 19)]) // Mantener últimas 20
  }

  // Funciones específicas para cada tipo de actividad
  const addMemberActivity = (memberName) => {
    addActivity(
      'new_member',
      memberName,
      'Nuevo socio registrado'
    )
  }

  const addPaymentActivity = (memberName, amount) => {
    addActivity(
      'payment',
      memberName,
      `Pago de membresía - $${amount}`,
      { amount }
    )
  }

  const addCheckinActivity = (memberName) => {
    addActivity(
      'checkin',
      memberName,
      'Check-in en el gimnasio'
    )
  }

  const addQuickCheckinActivity = () => {
    addActivity(
      'checkin',
      'Check-in rápido',
      'Check-in desde dashboard'
    )
  }

  const value = {
    recentActivity,
    addActivity,
    addMemberActivity,
    addPaymentActivity,
    addCheckinActivity,
    addQuickCheckinActivity
  }

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  )
}