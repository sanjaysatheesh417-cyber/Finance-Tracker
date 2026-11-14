from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas

def create_transaction(db: Session, payload: schemas.TransactionCreate) -> models.Transaction:
    transaction = models.Transaction(
        amount= payload.amount,
        mode = payload.mode,
        transaction_date = payload.transaction_date,
        description = payload.description
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def get_transactions(db: Session, mode: models.Mode, sort_by: str = "time", order: str = "asc", limit: int = 20,
                     offset: int = 0) -> list[models.Transaction]:
    query = db.query(models.Transaction)
    if mode is not None:
        query = query.filter(models.Transaction.mode == mode)

    sort_columns = {
        "time": models.Transaction.created_at,
        "added_on": models.Transaction.transaction_date,
        "mode": models.Transaction.mode 
    }
    column = sort_columns[sort_by]
    if order == "desc":
        column = column.desc()
    else:
        column = column.asc()
    return query.order_by(column, models.Transaction.id).offset(offset).limit(limit).all()