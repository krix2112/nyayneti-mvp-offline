import requests
import json

print("Testing exact user query...")
try:
    # First check status
    status = requests.get("http://localhost:8000/api/status").json()
    print(f"Status: {json.dumps(status, indent=2)}")

    # Then run query
    url = "http://localhost:8000/api/query"
    payload = {"question": "Which Articles of the Constitution were cited in the petition filed on 19 January 2023"}
    response = requests.post(url, json=payload, timeout=30)
    print(f"Query Result (HTTP {response.status_code}):")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Failed: {e}")
