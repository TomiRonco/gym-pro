import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const Portal = ({ children, containerId = 'modal-root' }) => {
  const [container, setContainer] = useState(null)

  useEffect(() => {
    // Buscar o crear el contenedor
    let portalContainer = document.getElementById(containerId)
    
    if (!portalContainer) {
      portalContainer = document.createElement('div')
      portalContainer.id = containerId
      document.body.appendChild(portalContainer)
    }
    
    setContainer(portalContainer)

    // Cleanup si el componente se desmonta
    return () => {
      if (portalContainer && portalContainer.childNodes.length === 0) {
        document.body.removeChild(portalContainer)
      }
    }
  }, [containerId])

  if (!container) return null

  return createPortal(children, container)
}

export default Portal