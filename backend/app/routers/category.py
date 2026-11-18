from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CategoryCreate, CategoryRead
from app.services import category as category_service

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    try:
        return category_service.create_category(db, payload)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")

@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    return category_service.get_categories(db)

@router.delete("/{category_id}")
def delete_category(category_id: int,db: Session = Depends(get_db)):
    result = category_service.delete_category(db, category_id)
    if result == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    if result == "in_use":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Reassign this category's transactions before deleting it")

    return {'deleted': True} 