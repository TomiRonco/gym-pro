import React, { createContext, useContext, useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider')
  }
  return context
}

const NotificationComponent = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-300 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-300 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-300 text-blue-900'
    }
  }

  const handleActionClick = (action) => {
    action.action()
    onClose(notification.id)
  }

  return (
    <div className={`min-w-80 max-w-md w-full shadow-xl rounded-xl border-2 ${getColorClasses()} pointer-events-auto transform transition-all duration-300`}>
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-4 w-0 flex-1">
            {notification.title && (
              <p className="text-base font-semibold leading-6">
                {notification.title}
              </p>
            )}
            <p className={`text-sm leading-5 ${notification.title ? 'mt-2' : ''}`}>
              {notification.message}
            </p>
            
            {/* Action Buttons */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-4 flex space-x-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      action.variant === 'danger'
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        : action.variant === 'secondary'
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md p-1"
              onClick={() => onClose(notification.id)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      autoClose: true,
      duration: 5000,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove notification
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const removeAllNotifications = () => {
    setNotifications([])
  }

  // Helper functions for different types
  const success = (message, title = null, options = {}) => {
    return addNotification({ type: 'success', message, title, ...options })
  }

  const error = (message, title = null, options = {}) => {
    return addNotification({ type: 'error', message, title, ...options })
  }

  const warning = (message, title = null, options = {}) => {
    return addNotification({ type: 'warning', message, title, ...options })
  }

  const info = (message, title = null, options = {}) => {
    return addNotification({ type: 'info', message, title, ...options })
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-6 right-6 z-50 space-y-4 max-w-md">
        {notifications.map((notification) => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationContext