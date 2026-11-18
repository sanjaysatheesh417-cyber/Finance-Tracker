from decimal import Decimal


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

def test_create_with_invalid_amount_returns_422(client):
    response = client.post(
        "/FinanceTracker/transactions",
        json={
            "amount": "not-a-number",
            "transaction_date": "2026-11-15",
            "mode": "debited",
            "description": "Groceries"
        }
    )
    assert response.status_code == 422

def test_delete_missing_transaction_returns_404(client):
    response = client.delete(
        "/FinanceTracker/transactions/9999999"
    )
    assert response.status_code == 404

def test_create_transaction_with_category(client):
    category_response = client.post("/categories", json={"name":"food"})
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]
    response = client.post(
        "/FinanceTracker/transactions",
        json={
            "amount":125,
            "transaction_date": "2026-11-18",
            "mode": "debited",
            "description": "Lunch",
            "category_id": category_id
        }
    )
    assert response.status_code == 201
    assert response.json()["category_id"] == category_id

def test_update_transaction_category(client):
    created = make_transaction(client)
    category_response = client.post("/categories", json={"name":"food"})
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]
    response = client.patch(
        f"/FinanceTracker/transactions/{created['id']}",
        json={"category_id": category_id}
    )
    assert response.status_code == 200
    assert response.json()["category_id"] == category_id