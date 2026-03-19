#!/usr/bin/env python3
"""
Simple test of visitor API authentication
"""
import requests
import json

# Login test
login_data = {
    "username": "guard001",
    "password": "guard001pass"
}

print("Testing visitor management system...")
print("Attempting guard login...")

try:
    response = requests.post("http://localhost:8000/api/auth/login/", json=login_data)
    print(f"Login response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"Login successful! Token received: {token[:20]}...")
        
        # Test visitor list
        headers = {"Authorization": f"Bearer {token}"}
        visitors_response = requests.get("http://localhost:8000/api/visitors/", headers=headers)
        print(f"Visitors list response: {visitors_response.status_code}")
        
        if visitors_response.status_code == 200:
            visitors = visitors_response.json()
            print(f"Current visitors count: {len(visitors)}")
        else:
            print(f"Visitors list error: {visitors_response.text}")
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")