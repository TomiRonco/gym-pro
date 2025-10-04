import { authenticatedFetch } from '../config/api'

export const settingsService = {
  // ====== CONFIGURACIÓN DEL GIMNASIO ======
  getGymSettings: async () => {
    const response = await authenticatedFetch('/settings/gym')
    if (!response || !response.ok) {
      throw new Error('Error al obtener configuración del gimnasio')
    }
    return await response.json()
  },

  updateGymSettings: async (settings) => {
    const response = await authenticatedFetch('/settings/gym', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
    if (!response || !response.ok) {
      throw new Error('Error al actualizar configuración del gimnasio')
    }
    return await response.json()
  },

  // ====== HORARIOS ======
  getSchedules: async () => {
    const response = await authenticatedFetch('/settings/schedules')
    if (!response || !response.ok) {
      throw new Error('Error al obtener horarios')
    }
    return await response.json()
  },

  getSchedulesByDay: async (day) => {
    const response = await authenticatedFetch(`/settings/schedules/day/${day}`)
    if (!response || !response.ok) {
      throw new Error('Error al obtener horarios del día')
    }
    return await response.json()
  },

  getSchedule: async (scheduleId) => {
    const response = await authenticatedFetch(`/settings/schedules/${scheduleId}`)
    if (!response || !response.ok) {
      throw new Error('Error al obtener horario')
    }
    return await response.json()
  },

  createSchedule: async (scheduleData) => {
    const response = await authenticatedFetch('/settings/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleData)
    })
    if (!response || !response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Error al crear horario')
    }
    return await response.json()
  },

  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await authenticatedFetch(`/settings/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleData)
    })
    if (!response || !response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Error al actualizar horario')
    }
    return await response.json()
  },

  deleteSchedule: async (scheduleId) => {
    const response = await authenticatedFetch(`/settings/schedules/${scheduleId}`, {
      method: 'DELETE'
    })
    if (!response || !response.ok) {
      throw new Error('Error al eliminar horario')
    }
    return await response.json()
  },

  clearAllSchedules: async () => {
    const response = await authenticatedFetch('/settings/schedules/clear/all', {
      method: 'DELETE'
    })
    if (!response || !response.ok) {
      throw new Error('Error al limpiar horarios')
    }
    return await response.json()
  },

  // ====== PLANES DE MEMBRESÍA ======
  getMembershipPlans: async () => {
    const response = await authenticatedFetch('/settings/membership-plans')
    return response
  },

  getAllMembershipPlans: async () => {
    const response = await authenticatedFetch('/settings/membership-plans/all')
    return response
  },

  getMembershipPlan: async (planId) => {
    const response = await authenticatedFetch(`/settings/membership-plans/${planId}`)
    return response
  },

  createMembershipPlan: async (planData) => {
    const response = await authenticatedFetch('/settings/membership-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(planData)
    })
    return response
  },

  updateMembershipPlan: async (planId, planData) => {
    const response = await authenticatedFetch(`/settings/membership-plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(planData)
    })
    return response
  },

  deleteMembershipPlan: async (planId) => {
    const response = await authenticatedFetch(`/settings/membership-plans/${planId}`, {
      method: 'DELETE'
    })
    return response
  }
}