from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Numeric, Date
from database import Base
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