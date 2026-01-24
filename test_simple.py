import requests
import json
try:
    response = requests.post("http://localhost:8000/api/query", json={"question": "hello"}, timeout=60)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
