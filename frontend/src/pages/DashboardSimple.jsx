import React from 'react';

const DashboardSimple = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Simple</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Miembros Totales</h3>
          <p className="text-3xl font-bold text-blue-600">150</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Miembros Activos</h3>
          <p className="text-3xl font-bold text-green-600">142</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Asistencias Hoy</h3>
          <p className="text-3xl font-bold text-purple-600">28</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Ingresos del Mes</h3>
          <p className="text-3xl font-bold text-yellow-600">$45,230</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <p className="text-gray-600">Dashboard funcionando correctamente</p>
      </div>
    </div>
  );
};

export default DashboardSimple;