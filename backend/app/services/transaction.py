from sqlalchemy.orm import Session
from .. import models, schemas
from fastapi import HTTPException

def check_category_owner(db: Session, category_id: int | None, user_id: int) -> None:
    if category_id is None:
        return
    category = (
        db.query(models.Category).filter(
            models.Category.id == category_id,
            models.Category.user_id == user_id,
        ).first()
    )
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
def create_transaction(db: Session, payload: schemas.TransactionCreate, user_id: int) -> models.Transaction:
    check_category_owner(db, payload.category_id, user_id)
    transaction = models.Transaction(
        user_id = user_id,
        amount= payload.amount,
        mode = payload.mode,
        transaction_date = payload.transaction_date,
        description = payload.description,
        category_id = payload.category_id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def get_transactions(db: Session,user_id: int, mode: models.Mode | None = None, sort_by: str = "time", order: str = "asc", limit: int = 20,
                     offset: int = 0) -> list[models.Transaction]:
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
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

def delete_transaction(db: Session, trans_id: int, user_id: int) -> bool:
    transaction = (db.query(models.Transaction).filter(models.Transaction.id == trans_id
                                                      , models.Transaction.user_id == user_id,).first())
    if transaction is None:
        return False
    db.delete(transaction)
    db.commit()
    return True

def update_transaction(db: Session, trans_id: int, payload: schemas.TransactionUpdate, user_id: int):
    transaction = (db.query(models.Transaction).filter(models.Transaction.id == trans_id
                                                       , models.Transaction.user_id == user_id).first())
    if transaction is None:
        return None
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        check_category_owner(db, updates["category_id"], user_id)
    if not updates:
        return transaction
    for field, value in updates.items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction