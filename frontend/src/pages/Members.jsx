import React from 'react'
import { Users, Plus } from 'lucide-react'

const Members = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Socios</h1>
          <p className="mt-2 text-gray-600">Gestión de miembros del gimnasio</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>Nuevo Socio</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Socios</h2>
        </div>
        
        <div className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo en Desarrollo</h3>
          <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
        </div>
      </div>
    </div>
  )
}

export default Members