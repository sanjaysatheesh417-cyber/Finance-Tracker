from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, schemas

def create_budget(db: Session, payload: schemas.BudgetCreate) -> models.Budget | None:
    category_exists = (
        db.query(models.Category.id).filter(models.Category.id == payload.category_id).first()
    )

    if category_exists is None:
        return None

    budget = models.Budget(
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

def get_budgets(db: Session, year: int, month: int) -> list[models.Budget]:
    return (
        db.query(models.Budget).filter(models.Budget.year == year, models.Budget.month == month)
        .order_by(models.Budget.category_id).all()
    )

def update_budget(db: Session, budget_id: int, payload: schemas.BudgetUpdate) -> models.Budget | None:
    budget = (
        db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    )
    if budget is None:
        return None
    budget.amount = payload.amount
    db.commit()
    db.refresh(budget)
    return budget