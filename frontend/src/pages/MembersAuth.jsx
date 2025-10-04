import React from 'react'
import { Users, AlertCircle, LogIn } from 'lucide-react'

const MembersAuth = () => {
  // Verificar el token en localStorage
  const token = localStorage.getItem('access_token')
  
  const handleRelogin = () => {
    localStorage.removeItem('access_token')
    window.location.reload()
  }

  const checkToken = () => {
    const token = localStorage.getItem('access_token')
    console.log('Token en localStorage:', token ? 'Existe' : 'No existe')
    if (token) {
      console.log('Token length:', token.length)
      console.log('Token preview:', token.substring(0, 50) + '...')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600">Diagnóstico de autenticación</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-4">Error de Autorización</h3>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Estado del Token:</strong> {token ? '✅ Existe' : '❌ No existe'}
                </p>
                {token && (
                  <p className="text-xs text-gray-500 break-all">
                    {token.substring(0, 100)}...
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={checkToken}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Verificar Token en Consola
                </button>
                
                <button
                  onClick={handleRelogin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <LogIn size={20} />
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Si el problema persiste:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Haz clic en "Volver a Iniciar Sesión"</li>
                <li>Usa: admin@gym.com / admin123</li>
                <li>Vuelve a intentar acceder a Socios</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MembersAuth