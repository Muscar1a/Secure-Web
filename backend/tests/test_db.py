import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017/test_db")

from main import app  

client = TestClient(app)

def test_health_db_ok():
    """
    GET /health/db should return status ok (200).
    """
    response = client.get("/health/db")
    assert response.status_code == 200, response.text
    assert response.json() == {"status": "ok"}
