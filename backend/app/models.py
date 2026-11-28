from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Numeric, Date, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default= lambda: datetime.now(timezone.utc), nullable=False)

    transactions = relationship("Transaction", back_populates="user")
    categories = relationship("Category", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
class Mode(str, enum.Enum):
    debited = "debited"
    credited = "credited"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    mode = Column(Enum(Mode, name="transaction_mode"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    category = relationship("Category", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)

    transactions = relationship(
        "Transaction",
        back_populates="category"
    )
    user = relationship("User", back_populates="categories")

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_categories_user_name",),
    )

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)

    user = relationship("User", back_populates="budgets")
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "category_id",
            "year",
            "month",
            name="uq_budgets_category_period",
        ),
        CheckConstraint("month >= 1 AND month <= 12"),
        CheckConstraint("amount > 0"),
    )