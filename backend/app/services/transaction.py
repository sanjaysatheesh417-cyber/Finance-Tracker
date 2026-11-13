from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

def create_transactions(db: Session, payload: schemas.TransactionCreate) -> models.Transaction:
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

def get_transactions(db: Session) -> models.Transaction|None:
    return db.query(models.Transaction)