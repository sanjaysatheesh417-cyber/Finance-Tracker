from datetime import date
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import models

def get_monthly_category_spending(
        db: Session,
        year: int,
        month: int,
) -> list[dict]:
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year+1,1,1)
    else:
        end_date = date(year, month+1,1)

    rows = (
        db.query(
            models.Transaction.category_id,
            models.Category.name,
            func.sum(models.Transaction.amount).label("total")
        ).outerjoin(
            models.Category,
            models.Transaction.category_id == models.Category.id
        ).filter(
            models.Transaction.mode == models.Mode.debited,
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date < end_date
        ).group_by(models.Transaction.category_id, models.Category.name)
        .order_by(models.Category.name).all()
    )

    return [{
        "category_id": category_id,
        "category_name": name or "Uncategorized",
        "total": total
    } for category_id, name, total in rows]