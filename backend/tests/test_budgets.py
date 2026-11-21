from decimal import Decimal

def make_budget(client):
    category_response = client.post(
        "/categories", json={"name": "food"}
    )
    assert category_response.status_code == 201
    category_id = category_response.json()["id"]

    response = client.post(
        "/budgets",
        json={
            "category_id": category_id,
            "year": 2026,
            "month": 11,
            "amount": "10000.00"
        }
    )
    assert response.status_code == 201
    return response.json()

def test_update_budget_amount(client):
    budget = make_budget(client)
    response = client.patch(
        f"/budgets/{budget['id']}", json={"amount": "12500.00"}
    )
    assert response.status_code == 200
    updated = response.json()
    assert Decimal(str(updated["amount"])) == Decimal("12500.00")
    assert updated["category_id"] == budget["category_id"]

def test_update_missing_budget_returns_404(client):
    response = client.patch(
        "/budgets/999999",
        json={"amount": "5000.00"}
    )
    assert response.status_code == 404