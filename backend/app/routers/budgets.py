from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services import budgets as budget_service
from app.core.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.post("", response_model=schemas.BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        budget = budget_service.create_budget(db, payload, user_id=current_user.id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget already exists for this category and month"
        )

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return budget

@router.get("", response_model=list[schemas.BudgetRead])
def list_budgets(
    year: int = Query(ge=1, le=9998),
    month: int = Query(ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.get_budgets(db, year, month, user_id = current_user.id)

@router.patch("/{budget_id}", response_model=schemas.BudgetRead)
def update_budget(budget_id: int, payload: schemas.BudgetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = budget_service.update_budget(db, budget_id, payload, user_id=current_user.id)

    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    return budget