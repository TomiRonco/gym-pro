import { useState, useRef } from 'react'
import React from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    loading: false
  })
  
  const resolveRef = useRef(null)

    const showConfirm = (title, message, type = 'danger') => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfirmState({
        isOpen: true,
        title,
        message,
        type
      })
    })
  }

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setConfirmState({ isOpen: false, title: '', message: '' })
  }

  const handleCancel = () => {
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
    setConfirmState({ isOpen: false, title: '', message: '' })
  }

  const setLoading = (loading) => {
    setConfirmState(prev => ({ ...prev, loading }))
  }

  return {
    confirmState,
    showConfirm,
    handleConfirm,
    handleCancel,
    setLoading
  }
}

// Hook más simple para casos básicos
export const useSimpleConfirm = () => {
  const { confirmState, showConfirm, handleConfirm, handleCancel } = useConfirm()

  const confirm = (options) => {
    if (typeof options === 'string') {
      // Retrocompatibilidad para calls simples
      return showConfirm({
        title: '¿Estás seguro?',
        message: options,
        type: 'warning',
        confirmText: 'Sí, confirmar',
        cancelText: 'Cancelar'
      })
    }
    
    return showConfirm({
      title: options.title || '¿Estás seguro?',
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar'
    })
  }

  const confirmDelete = (itemName = 'este elemento') => {
    return showConfirm({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    })
  }

  const ConfirmDialogComponent = () => React.createElement(ConfirmDialog, {
    isOpen: confirmState.isOpen,
    onClose: handleCancel,
    onConfirm: handleConfirm,
    title: confirmState.title,
    message: confirmState.message,
    confirmText: confirmState.confirmText,
    cancelText: confirmState.cancelText,
    type: confirmState.type,
    loading: confirmState.loading
  })

  return {
    confirm,
    confirmDelete,
    ConfirmDialog: ConfirmDialogComponent
  }
}