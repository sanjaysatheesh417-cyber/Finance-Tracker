from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Numeric, Date, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone
import enum

class Mode(str, enum.Enum):
    debited = "debited"
    credited = "credited"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    mode = Column(Enum(Mode, name="transaction_mode"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    category = relationship("Category", back_populates="transactions")
class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    transactions = relationship(
        "Transaction",
        back_populates="category"
    )

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "category_id",
            "year",
            "month",
            name="uq_budgets_category_period"
        ),
        CheckConstraint("month >= 1 AND month <= 12"),
        CheckConstraint("amount > 0")
    )