#!/usr/bin/env python3
"""
Test script for visitor management system
"""
import requests
import json

# API endpoints 
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
VISITORS_URL = f"{BASE_URL}/api/visitors/"

# Test credentials
GUARD_CREDENTIALS = {
    "username": "guard001",
    "password": "guard001pass"
}

# Test visitor data
TEST_VISITOR = {
    "name": "John Smith",
    "national_id": "12345678",
    "phone": "0712345678", 
    "email": "john.smith@email.com",
    "organization": "ABC Company",
    "purpose_category": "MEETING",
    "purpose_details": "Quarterly business review with finance department",
    "host_name": "Dr. Mary Johnson",
    "host_email": "mary.johnson@university.edu",
    "department": "Finance Department",
    "office_location": "Block C - Room 205",
    "expected_duration": 90
}

def login_and_get_token(credentials):
    """Login and return authentication token"""
    response = requests.post(LOGIN_URL, json=credentials)
    if response.status_code == 200:
        data = response.json()
        return data.get('access')
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_visitor_creation(token):
    """Test creating a new visitor"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing visitor creation...")
    response = requests.post(VISITORS_URL, json=TEST_VISITOR, headers=headers)
    
    if response.status_code == 201:
        visitor = response.json()
        print(f"✅ Visitor created successfully!")
        print(f"   ID: {visitor['id']}")
        print(f"   Name: {visitor['name']}")
        print(f"   Status: {visitor['status']}")
        print(f"   QR Token: {visitor['qr_token']}")
        print(f"   Expected End Time: {visitor['expected_end_time']}")
        print(f"   QR Code URL: {visitor.get('qr_code_url', 'Not available')}")
        return visitor
    else:
        print(f"❌ Visitor creation failed: {response.status_code} - {response.text}")
        return None

def test_visitor_confirmation(visitor_id, token):
    """Test adding host confirmation"""
    headers = {"Authorization": f"Bearer {token}"}
    
    confirmation_data = {
        "confirmation_type": "EXPECTED",
        "confirmed_by": "Dr. Mary Johnson", 
        "notes": "Host confirmed expecting visitor for scheduled meeting"
    }
    
    print("\nTesting visitor confirmation...")
    response = requests.post(f"{VISITORS_URL}{visitor_id}/confirm/", 
                           json=confirmation_data, headers=headers)
    
    if response.status_code == 200:
        confirmation = response.json()
        print(f"✅ Confirmation added successfully!")
        print(f"   Type: {confirmation['confirmation_type']}")
        print(f"   Confirmed by: {confirmation['confirmed_by']}")
        print(f"   Notes: {confirmation['notes']}")
        return confirmation
    else:
        print(f"❌ Confirmation failed: {response.status_code} - {response.text}")
        return None

def test_visitor_list(token):
    """Test listing visitors"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nTesting visitor list...")
    response = requests.get(VISITORS_URL, headers=headers)
    
    if response.status_code == 200:
        visitors = response.json()
        print(f"✅ Visitor list retrieved successfully!")
        print(f"   Total visitors: {len(visitors)}")
        for visitor in visitors[:3]:  # Show first 3
            print(f"   - {visitor['name']} ({visitor['status']})")
        return visitors
    else:
        print(f"❌ Visitor list failed: {response.status_code} - {response.text}")
        return None

def test_pending_visitors(token):
    """Test pending visitors endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\nTesting pending visitors...")
    response = requests.get(f"{VISITORS_URL}pending/", headers=headers)
    
    if response.status_code == 200:
        pending = response.json()
        print(f"✅ Pending visitors retrieved: {len(pending)} pending")
        return pending
    else:
        print(f"❌ Pending visitors failed: {response.status_code} - {response.text}")
        return None

def main():
    print("🚪 Testing Visitor Management System")
    print("=" * 40)
    
    # Step 1: Login
    print("\n1. Logging in as guard...")
    token = login_and_get_token(GUARD_CREDENTIALS)
    if not token:
        print("Failed to get authentication token. Exiting.")
        return
    
    print("✅ Login successful!")
    
    # Step 2: Create visitor
    visitor = test_visitor_creation(token)
    if not visitor:
        return
        
    # Step 3: Add confirmation
    confirmation = test_visitor_confirmation(visitor['id'], token)
    
    # Step 4: List all visitors
    visitors = test_visitor_list(token)
    
    # Step 5: Check pending visitors
    pending = test_pending_visitors(token)
    
    print("\n" + "=" * 40)
    print("🎉 Visitor Management System Test Complete!")
    print("\nSummary:")
    print(f"- Visitor created: {visitor['name'] if visitor else 'Failed'}")
    print(f"- Confirmation added: {'Yes' if confirmation else 'No'}")
    print(f"- Total visitors: {len(visitors) if visitors else 'Unknown'}")
    print(f"- Pending visitors: {len(pending) if pending else 'Unknown'}")

if __name__ == "__main__":
    main()