from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/reset-database")
def reset_database(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Resetear toda la base de datos manteniendo solo la cuenta admin
    CUIDADO: Esta operación elimina todos los datos permanentemente
    """
    
    # Verificar que el usuario actual sea admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden resetear la base de datos"
        )
    
    try:
        # Verificar conexión de base de datos
        logger.info("Starting database reset operation")
        
        # Deshabilitar verificaciones de claves foráneas temporalmente
        db.execute(text("PRAGMA foreign_keys=OFF"))
        
        # Eliminar todos los registros en orden específico
        tables_to_clear = [
            "payments", 
            "members",
            "membership_plans",
            "schedules",
            "gym_settings"
        ]
        
        deleted_counts = {}
        for table in tables_to_clear:
            try:
                result = db.execute(text(f"DELETE FROM {table}"))
                deleted_counts[table] = result.rowcount if hasattr(result, 'rowcount') else 0
                logger.info(f"Cleared table {table}: {deleted_counts[table]} records")
            except Exception as table_error:
                logger.error(f"Error clearing table {table}: {str(table_error)}")
                raise table_error
        
        # Resetear secuencias de auto-incremento
        try:
            db.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('payments', 'members', 'membership_plans', 'schedules', 'gym_settings')"))
            logger.info("Reset auto-increment sequences")
        except Exception as seq_error:
            logger.warning(f"Could not reset sequences: {str(seq_error)}")
        
        # Rehabilitar verificaciones de claves foráneas
        db.execute(text("PRAGMA foreign_keys=ON"))
        
        # Confirmar cambios
        db.commit()
        logger.info("Database reset completed successfully")
        
        return {
            "message": "Base de datos reseteada exitosamente",
            "details": {
                "tables_cleared": list(deleted_counts.keys()),
                "total_records_deleted": sum(deleted_counts.values()),
                "admin_preserved": "Cuenta de administrador conservada"
            }
        }
        
        
    except Exception as e:
        db.rollback()
        logger.error(f"Database reset failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al resetear la base de datos: {str(e)}"
        )