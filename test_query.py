import requests
import json

response = requests.post(
    "http://localhost:8000/api/query",
    json={"question": "What are the bail principles based on the uploaded cases?"}
)

try:
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    print(f"Raw response: {response.text}")
