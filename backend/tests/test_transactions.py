import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app as fastapi_app
from app.database import Base, get_db
import app.models

@pytest.fixture
def client():
    test_engine = create_engine("sqlite://", connect_args={"check_same_thread":False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(
        bind=test_engine,
        autocommit=False,
        autoflush=False
    )
    Base.metadata.create_all(bind=test_engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db

    with TestClient(fastapi_app) as test_client:
        yield test_client

    fastapi_app.dependency_overrides.pop(get_db, None)
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()

def make_transaction(client):
    response = client.post("/FinanceTracker/transactions", json={
        "amount": 300,
        "transaction_date": "2026-11-15",
        "mode": "debited",
        "description": "Groceries"
    })
    assert response.status_code == 201
    return response.json()

def test_create_and_read_transaction(client):
    created = make_transaction(client)
    response = client.get("/FinanceTracker/transactions")
    assert response.status_code == 200
    transactions = response.json()
    saved = next(item for item in transactions if item["id"] == created["id"])
    assert Decimal(str(saved["amount"])) == Decimal("300")
    assert saved["description"] == "Groceries"

def test_update_transaction(client):
    created = make_transaction(client)
    response = client.patch(f"/FinanceTracker/transactions/{created['id']}",
                            json={"amount":300, "description":"weekly groceries"})
    assert response.status_code == 200
    updated = response.json()
    assert Decimal(str(updated["amount"])) == Decimal("300")
    assert updated["description"] == "weekly groceries"
    assert updated["mode"] == "debited"

def test_delete_transaction(client):
    created = make_transaction(client)
    response = client.delete(
        f"/FinanceTracker/transactions/{created['id']}"
    )
    assert response.status_code == 200
    assert response.json() == {"deleted":True}

    remaining = client.get("/FinanceTracker/transactions").json()
    assert all(item["id"] != created["id"] for item in remaining)

def test_updated_missing_transaction_return_404(client):
    response = client.patch(
        "/FinanceTracker/transactions/9999999",
        json={"amount":350}
    )
    assert response.status_code == 404
