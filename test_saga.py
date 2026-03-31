import requests
import time
from datetime import datetime
import json

BASE_URL = "http://localhost:8080"

def run_tests():
    print("\n--- 1. Registering a Customer ---")
    reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "firstName": "Saga",
        "lastName": "Tester",
        "email": "sagatest@example.com",
        "password": "password123",
        "role": "CUSTOMER"
    })
    print("Register Status:", reg_res.status_code)
    
    print("\n--- 2. Logging in as Admin ---")
    admin_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "pragyavijay20318@gmail.com",
        "password": "vijay@**24"
    })
    if admin_res.status_code >= 300:
        print("Admin Login Failed!", admin_res.text)
        return
    admin_token = admin_res.json()["token"]

    print("\n--- 3. Creating PolicyType as Admin ---")
    pt_res = requests.post(f"{BASE_URL}/api/policy-types", 
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Saga Health Plan",
            "category": "HEALTH",
            "basePremium": 500,
            "maxCoverageAmount": 100000,
            "deductibleAmount": 100,
            "termMonths": 12
        })
    print("PolicyType Creation:", pt_res.status_code)
    if pt_res.status_code >= 300:
        print(pt_res.text)
        policy_type_id = 1
    else:
        policy_type_id = pt_res.json()["id"]

    print("\n--- 4. Logging in as Customer ---")
    cust_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "sagatest@example.com",
        "password": "password123"
    })
    cust_token = cust_res.json()["token"]

    print("\n--- 5. Purchasing Policy as Customer ---")
    purch_res = requests.post(f"{BASE_URL}/api/policies/purchase", 
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "policyTypeId": policy_type_id,
            "coverageAmount": 50000,
            "paymentFrequency": "MONTHLY",
            "startDate": datetime.today().strftime('%Y-%m-%d')
        })
    print("Purchase Status:", purch_res.status_code)
    if purch_res.status_code >= 300:
        print(purch_res.text)
        return
    policy_id = purch_res.json()["id"]

    print("\n--- 6. Extracting Generated Premium ID ---")
    prem_res = requests.get(f"{BASE_URL}/api/policies/{policy_id}/premiums", 
        headers={"Authorization": f"Bearer {cust_token}"})
    print("Get Premiums Status:", prem_res.status_code)
    premiums = prem_res.json()
    if not premiums:
        print("No premiums active!")
        return
    premium_id = premiums[0]["id"]
    
    print("\n--- 7. Initiating Payment (Simulating Checkout UI) ---")
    init_res = requests.post(f"{BASE_URL}/api/policies/premiums/pay", 
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "policyId": policy_id,
            "premiumId": premium_id,
            "paymentMethod": "CREDIT_CARD"
        })
    print("Initiate Payment Status:", init_res.status_code)
    print("Initiate Response:", init_res.text)
    if init_res.status_code >= 300:
        return
        
    rzp_order_id = init_res.json().get("razorpayOrderId", "dummy_order_id")

    print("\n--- 8. Confirming Payment to PaymentService (Frontend Mock) ---")
    conf_res = requests.post(f"{BASE_URL}/api/payments/confirm", 
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "razorpayOrderId": rzp_order_id,
            "razorpayPaymentId": "pay_SAGA_MOCK_123"
        })
    print("Confirm Payment Status:", conf_res.status_code)
    print("Confirm Response:", conf_res.text)

    print("\nWaiting 2 seconds for RabbitMQ Saga delivery...")
    time.sleep(2)

    print("\n--- 9. Verifying Premium Status is PAID ---")
    verify_res = requests.get(f"{BASE_URL}/api/policies/{policy_id}/premiums", 
        headers={"Authorization": f"Bearer {cust_token}"})
    print("Verified Premium Record:", json.dumps(verify_res.json()[0], indent=2))

    print("\n--- 10. Filing a Claim against Policy ---")
    claim_res = requests.post(f"{BASE_URL}/api/claims", 
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "policyId": policy_id
        })
    print("Claim Creation Status:", claim_res.status_code)
    print("Claim Result:", claim_res.text)

if __name__ == "__main__":
    run_tests()
