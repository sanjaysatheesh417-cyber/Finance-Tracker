from datetime import datetime, timezone, timedelta
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas

def create_category(db: Session, payload: schemas.CategoryCreate) -> models.Category:
    category = models.Category(
        name = payload.name
    )
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(category)
    return category

def get_categories(db: Session) -> list[models.Category]:
    return (db.query(models.Category).order_by(models.Category.name).all())