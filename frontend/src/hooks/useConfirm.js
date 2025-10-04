import { useState } from 'react'

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

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning',
    onConfirm = () => {}
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          resolve(true)
          onConfirm()
        },
        loading: false
      })
    })
  }

  const hideConfirm = () => {
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

  const confirm = (message, title = '¿Estás seguro?') => {
    return showConfirm({
      title,
      message,
      type: 'warning',
      confirmText: 'Sí, confirmar',
      cancelText: 'Cancelar'
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

  return {
    confirmState,
    hideConfirm,
    confirm,
    confirmDelete,
    confirmDeleteAll
  }
}