import { api } from './api.js'

export const membershipService = {
  // Obtener todos los planes activos
  async getPlans() {
    const response = await api.get('/settings/membership-plans')
    return response.data
  },

  // Obtener todos los planes (incluidos inactivos)
  async getAllPlans() {
    const response = await api.get('/settings/membership-plans/all')
    return response.data
  },

  // Obtener un plan específico
  async getPlan(planId) {
    const response = await api.get(`/settings/membership-plans/${planId}`)
    return response.data
  },

  // Crear un nuevo plan
  async createPlan(planData) {
    const response = await api.post('/settings/membership-plans', planData)
    return response.data
  },

  // Actualizar un plan existente
  async updatePlan(planId, planData) {
    const response = await api.put(`/settings/membership-plans/${planId}`, planData)
    return response.data
  },

  // Eliminar un plan (soft delete)
  async deletePlan(planId) {
    const response = await api.delete(`/settings/membership-plans/${planId}`)
    return response.data
  }
}