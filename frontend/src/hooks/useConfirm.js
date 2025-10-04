import { useState } from 'react'
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
    onConfirm: () => {},
    loading: false
  })
  
  let resolvePromise = null

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      resolvePromise = resolve
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          resolve(true)
          hideConfirm()
        },
        loading: false
      })
    })
  }

  const hideConfirm = () => {
    if (resolvePromise && confirmState.isOpen) {
      resolvePromise(false)
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }

  const setLoading = (loading) => {
    setConfirmState(prev => ({ ...prev, loading }))
  }

  return {
    confirmState,
    showConfirm,
    hideConfirm,
    setLoading
  }
}

// Hook más simple para casos básicos
export const useSimpleConfirm = () => {
  const { confirmState, showConfirm, hideConfirm } = useConfirm()

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

  const confirmDeleteAll = (count, itemType = 'elementos') => {
    return showConfirm({
      title: 'Eliminar Todo',
      message: `¿Estás seguro de que deseas eliminar TODOS los ${count} ${itemType}? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar todo',
      cancelText: 'Cancelar'
    })
  }

  const ConfirmDialogComponent = () => React.createElement(ConfirmDialog, {
    isOpen: confirmState.isOpen,
    onClose: hideConfirm,
    onConfirm: confirmState.onConfirm,
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
    confirmDeleteAll,
    ConfirmDialog: ConfirmDialogComponent
  }
}