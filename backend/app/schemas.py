from pydantic import BaseModel, ConfigDict, Field, model_validator, field_validator
from datetime import datetime, date
from .models import Mode
from decimal import Decimal

class TransactionBase(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    mode: Mode
    transaction_date: date
    description: str| None = Field(default=None, max_length=255)
    category_id: int | None = None

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
    category_id: int | None = None

    @model_validator(mode="after")
    def required_fields_cannot_be_null(self):
        for field_name in ("amount","transaction_date", "mode"):
            if (
                field_name in self.model_fields_set and getattr(self, field_name) is None
            ):
                raise ValueError(f"{field_name} cannot be null")
        return self

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)

    @field_validator("name")
    @classmethod
    def trim_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category name cannot be blank")
        return value
class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id : int
    name: str

class CategorySpending(BaseModel):
    category_id: int | None
    category_name: str
    total: Decimal

class BudgetCreate(BaseModel):
    category_id: int = Field(gt=0)
    year: int = Field(ge=1, le=9998)
    month: int = Field(ge=1, le=12)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)

class BudgetRead(BaseModel):
    id: int
    category_id: int
    year: int
    month: int
    amount: Decimal

    model_config = ConfigDict(from_attributes=True)

class BudgetUpdate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)