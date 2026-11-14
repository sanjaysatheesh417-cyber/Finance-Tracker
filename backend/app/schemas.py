from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from .models import Mode
from decimal import Decimal

class TransactionBase(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    mode: Mode
    transaction_date: date
    description: str| None = Field(default=None, max_length=255)

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    created_at: datetime

    model_config=ConfigDict(from_attributes=True)