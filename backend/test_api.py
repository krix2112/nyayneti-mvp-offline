import json

from app import create_app


def test_health_endpoint():
    app = create_app()
    client = app.test_client()
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"


def test_query_validation():
    app = create_app()
    client = app.test_client()
    resp = client.post("/api/query", json={})
    assert resp.status_code == 400
    data = resp.get_json()
    assert "error" in data

