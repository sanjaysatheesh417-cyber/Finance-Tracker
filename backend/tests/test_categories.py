def create_category(client):
    response = client.post("/categories", json={
        "name" : "salary"
    })
    assert response.status_code == 201
    return response.json()

def test_create_and_read_category(client):
    created = create_category(client)
    response = client.get("/categories")
    assert response.status_code == 200
    categories = response.json()
    saved = next(item for item in categories if item["id"] == created["id"])
    assert saved["name"] == "salary"

def test_duplicate_category_name_returns_409(client):
    create_category(client)
    response = client.post("/categories", json={"name": "salary"})

    assert response.status_code == 409
    assert response.json()["detail"] == "A category with this name already exists"

def test_delete_unused_category(client):
    created = create_category(client)
    response = client.delete(f"/categories/{created['id']}")
    assert response.status_code == 200
    assert response.json() == {"deleted": True}

def test_cannot_delete_category_used_by_transaction(client):
    created = create_category(client)

    transaction_response = client.post(
        "/FinanceTracker/transactions",
        json={
            "amount": 100,
            "transaction_date": "2026-11-19",
            "mode": "debited",
            "category_id": created["id"]
        }
    )
    assert transaction_response.status_code == 201

    response = client.delete(f"/categories/{created['id']}")
    assert response.status_code == 409

def test_cannot_delete_category_used_by_budget(client):
    category = create_category(client)
    budget_response = client.post(
        "/budgets",
        json={
            "category_id": category["id"],
            "year": 2026,
            "month": 11,
            "amount": "1000.00"
        }
    )
    assert budget_response.status_code == 201

    delete_response = client.delete(f"/categories/{category['id']}")
    assert delete_response.status_code == 409

def test_delete_missing_category_returns_404(client):
    response = client.delete("/categories/999999")
    assert response.status_code == 404