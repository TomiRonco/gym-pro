import React from 'react'
import { Users } from 'lucide-react'

const MembersSimple = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600">Prueba de navegación</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Página de Socios Cargada</h3>
          <p className="text-gray-500 mb-6">La navegación está funcionando correctamente</p>
          <p className="text-sm text-blue-600">Si ves este mensaje, la página se está cargando bien</p>
        </div>
      </div>
    </div>
  )
}

export default MembersSimple