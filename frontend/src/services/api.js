import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8001/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de Autenticación
export const authService = {
  async login(username, password) {
    console.log('🌐 API Service: Enviando login para', username, 'a', API_BASE_URL);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    console.log('📤 Enviando FormData a /auth/token');
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('📥 Respuesta recibida:', response.data);
    
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    console.log('💾 Token guardado en localStorage');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
};

// Servicios de Socios
export const membersService = {
  async getMembers(params = {}) {
    const response = await api.get('/members/', { params });
    return response.data;
  },

  async getMember(id) {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  async createMember(memberData) {
    const response = await api.post('/members/', memberData);
    return response.data;
  },

  async updateMember(id, memberData) {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  async deleteMember(id) {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  async toggleMemberStatus(id) {
    const response = await api.put(`/members/${id}/toggle-status`);
    return response.data;
  }
};

// Servicios de Pagos
export const paymentsService = {
  async getPayments(params = {}) {
    const response = await api.get('/payments/', { params });
    return response.data;
  },

  async getPayment(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async createPayment(paymentData) {
    const response = await api.post('/payments/', paymentData);
    return response.data;
  },

  async verifyPayment(id) {
    const response = await api.put(`/payments/${id}/verify`);
    return response.data;
  },

  async getMemberPayments(memberId) {
    const response = await api.get(`/payments/member/${memberId}`);
    return response.data;
  }
};

// Servicios de Asistencia
export const attendanceService = {
  async getAttendances(params = {}) {
    const response = await api.get('/attendance/', { params });
    return response.data;
  },

  async checkIn(memberData) {
    const response = await api.post('/attendance/check-in', memberData);
    return response.data;
  },

  async checkOut(attendanceId) {
    const response = await api.put(`/attendance/${attendanceId}/check-out`);
    return response.data;
  },

  async getMemberAttendances(memberId) {
    const response = await api.get(`/attendance/member/${memberId}`);
    return response.data;
  },

  async getTodayAttendances() {
    const response = await api.get('/attendance/today');
    return response.data;
  }
};

// Servicios de Dashboard
export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getRecentActivity() {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  }
};

export default api;