from decimal import Decimal

def test_monthly_category_spending_groups_expenses(client):
    category_response = client.post("/categories", json={"name":"food"})
    assert category_response.status_code == 201
    food_id = category_response.json()["id"]

    transactions = [
        {"amount": "100.00", "transaction_date": "2026-11-01",
         "mode": "debited", "category_id": food_id},
        {"amount": "50.00", "transaction_date": "2026-11-30",
         "mode": "debited", "category_id": food_id},
        {"amount": "20.00", "transaction_date": "2026-11-15",
         "mode": "debited", "category_id": None},
        {"amount": "500.00", "transaction_date": "2026-11-10",
         "mode": "credited", "category_id": food_id},
        {"amount": "80.00", "transaction_date": "2026-12-01",
         "mode": "debited", "category_id": food_id}
    ]

    for transaction in transactions:
        response = client.post("/FinanceTracker/transactions", json=transaction)
        assert response.status_code == 201

    response = client.get("/reports/monthly/category-spending",
                              params={"year": 2026, "month": 11})
    assert response.status_code == 200
    totals = {row["category_name"]: Decimal(str(row["total"])) for row in response.json()}
    assert totals == {"food": Decimal("150.00"), "Uncategorized": Decimal("20.00")}