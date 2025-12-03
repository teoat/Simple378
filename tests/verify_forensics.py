import requests
import os

def test_forensics_endpoint():
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Login
    login_data = {
        "username": "admin@example.com",
        "password": "password" 
    }
    try:
        login_response = requests.post(f"{base_url}/login/access-token", data=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Upload File
        with open("test_image.txt", "w") as f:
            f.write("This is a test file for forensics analysis.")
            
        files = {"file": ("test_image.txt", open("test_image.txt", "rb"), "text/plain")}
        response = requests.post(f"{base_url}/forensics/analyze", files=files, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Forensics endpoint verification passed!")
        else:
            print("❌ Forensics endpoint verification failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if os.path.exists("test_image.txt"):
            os.remove("test_image.txt")

if __name__ == "__main__":
    test_forensics_endpoint()
