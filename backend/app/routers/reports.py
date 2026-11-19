from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services import reports as report_service

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/monthly/category-spending", response_model=list[schemas.CategorySpending])
def monthly_category_spending(
    year: int = Query(ge=1, le=9998),
    month: int = Query(ge=1, le=12),
    db: Session = Depends(get_db)
):
    return report_service.get_monthly_category_spending(db, year, month)