from pydantic import BaseModel, ConfigDict, Field, model_validator
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

class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    transaction_date: date | None = None
    mode: Mode | None = None
    description: str | None = None

    @model_validator(mode="after")
    def required_fields_cannot_be_null(self):
        for field_name in ("amount","transaction_date", "mode"):
            if (
                field_name in self.model_fields_set and getattr(self, field_name) is None
            ):
                raise ValueError(f"{field_name} cannot be null")
        return self