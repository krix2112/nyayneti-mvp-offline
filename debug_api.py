import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/api/query",
        json={"question": "test"},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(response.text[:1000])
except Exception as e:
    print(f"Request failed: {e}")
