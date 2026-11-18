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