import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "admin@example.com"
PASSWORD = "password"

def test_login():
    print(f"Testing login for {EMAIL} at {BASE_URL}/login/access-token")
    try:
        response = requests.post(
            f"{BASE_URL}/login/access-token",
            data={"username": EMAIL, "password": PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Login SUCCESS")
            return True
        else:
            print("Login FAILED")
            return False
    except Exception as e:
        print(f"Exception during request: {e}")
        return False

if __name__ == "__main__":
    if test_login():
        sys.exit(0)
    else:
        sys.exit(1)
