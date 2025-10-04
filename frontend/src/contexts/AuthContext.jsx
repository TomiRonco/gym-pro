import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error al obtener usuario:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔄 AuthContext: Iniciando login para', username);
      await authService.login(username, password);
      console.log('✅ AuthService.login exitoso, obteniendo usuario...');
      const userData = await authService.getCurrentUser();
      console.log('👤 Usuario obtenido:', userData);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('❌ Error en AuthContext.login:', error);
      console.error('📝 Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error de autenticación' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};