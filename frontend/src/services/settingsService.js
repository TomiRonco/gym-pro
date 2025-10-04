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
    return response
  },

  getSchedule: async (scheduleId) => {
    const response = await authenticatedFetch(`/settings/schedules/${scheduleId}`)
    return response
  },

  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await authenticatedFetch(`/settings/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scheduleData)
    })
    return response
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