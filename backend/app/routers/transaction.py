from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Literal

from sqlalchemy.orm import Session
from ..database import get_db
from ..services import transaction as service
from .. import schemas ,models

router = APIRouter(tags=["Finance Tracker"], prefix="/FinanceTracker")

NOT_FOUND = HTTPException(status_code=404, detail="transaction not found")

@router.post("/transactions", response_model=schemas.TransactionRead, status_code=status.HTTP_201_CREATED)
async def new_task(
    payload: schemas.TransactionCreate,
    db: Session = Depends(get_db),
):
    transaction = service.create_transaction(db, payload)
    return transaction

@router.get("/transactions", response_model=list[schemas.TransactionRead])
def list_transaction(
    mode: models.Mode | None = None,
    sort_by: Literal["time","added_on","mode"] = "time",
    order: Literal["asc","desc"] = "asc",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)):
    return service.get_transactions(db, mode, sort_by, order, limit, offset)

@router.delete("/transactions/{trans_id}")
def clear_transaction(trans_id: int, db: Session = Depends(get_db)):
    deleted = service.delete_transaction(db, trans_id)
    if not deleted:
        raise NOT_FOUND
    return {"deleted":True}

@router.patch("/transactions/{trans_id}", response_model=schemas.TransactionRead)
def update_transaction(trans_id: int, payload: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    transaction = service.update_transaction(db, trans_id, payload)
    if transaction is None:
        raise NOT_FOUND

    return transaction
