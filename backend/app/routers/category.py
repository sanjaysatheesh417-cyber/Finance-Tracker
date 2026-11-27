from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models import User
from app.database import get_db
from app.schemas import CategoryCreate, CategoryRead
from app.services import category as category_service

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    try:
        return category_service.create_category(db, payload, user_id=current_user.id,)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")

@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return category_service.get_categories(db, user_id=current_user.id)

@router.delete("/{category_id}")
def delete_category(category_id: int,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = category_service.delete_category(db, category_id, user_id=current_user.id)
    if result == "not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    if result == "in_use":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Reassign this category's transactions before deleting it")

    return {'deleted': True} 