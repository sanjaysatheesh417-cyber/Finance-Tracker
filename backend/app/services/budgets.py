from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, schemas

def create_budget(db: Session, payload: schemas.BudgetCreate, user_id: int) -> models.Budget | None:
    category_exists = (
        (db.query(models.Category.id).filter(models.Category.id == payload.category_id, 
                                            models.Category.user_id == user_id).first())
    )

    if category_exists is None:
        return None

    budget = models.Budget(
        user_id = user_id,
        category_id = payload.category_id,
        year = payload.year,
        month = payload.month,
        amount = payload.amount
    )
    db.add(budget)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(budget)
    return budget

def get_budgets(db: Session, year: int, month: int, user_id: int) -> list[models.Budget]:
    return (
        db.query(models.Budget).filter(models.Budget.user_id == user_id, models.Budget.year == year, models.Budget.month == month)
        .order_by(models.Budget.category_id).all()
    )

def update_budget(db: Session, budget_id: int, payload: schemas.BudgetUpdate, user_id: int) -> models.Budget | None:
    budget = (
        db.query(models.Budget).filter(models.Budget.id == budget_id,
                                       models.Budget.user_id == user_id).first()
    )
    if budget is None:
        return None
    budget.amount = payload.amount
    db.commit()
    db.refresh(budget)
    return budget