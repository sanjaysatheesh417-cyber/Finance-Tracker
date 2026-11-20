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

def delete_category(db: Session, category_id: int) -> str:
    category = (
        db.query(models.Category).filter(models.Category.id == category_id).first()
    )

    if category is None:
        return 'not_found'

    transaction_user_category = (
        db.query(models.Transaction.id).filter(models.Transaction.category_id == category_id).first()
    )

    if transaction_user_category is not None:
        return "in_use"

    budget_user_category = (
        db.query(models.Budget.id).filter(models.Budget.category_id == category_id).first()
    )

    if budget_user_category is not None:
        return "in_use"
    
    db.delete(category)
    db.commit()
    return "deleted"