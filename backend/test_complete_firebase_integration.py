import urllib.request
import urllib.error
import json
import sys
import functools
from database import get_db_connection

print = functools.partial(print, flush=True)

def post(url, data, headers=None):
    headers = headers or {}
    headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def get(url, headers=None):
    headers = headers or {}
    req = urllib.request.Request(url, headers=headers, method='GET')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def run_tests():
    print("====================================================================")
    print("HEALTHPULSE FIREBASE AUTHENTICATION COMPREHENSIVE INTEGRATION SUITE")
    print("====================================================================")

    # 1. Admin Login via Firebase Token
    print("\n[TEST 1] Admin Firebase Authentication...")
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-admin:admin@healthpulse.com",
        "role": "admin"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Role: {data.get('role')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "admin"
    admin_token = data.get("token")

    # 2. Doctor Login via Firebase Token
    print("\n[TEST 2] Doctor Firebase Authentication...")
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-doctor:dr.satyadeep@healthpulse.com",
        "role": "doctor"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Doctor ID: {data.get('user', {}).get('doctor_id')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "doctor"
    doctor_token = data.get("token")

    # 3. Patient Login via Firebase Token
    print("\n[TEST 3] Patient Firebase Authentication...")
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-patient:shravan@healthpulse.com",
        "role": "patient"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Patient ID: {data.get('user', {}).get('patient_id')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "patient"
    patient_token = data.get("token")

    # 4. Check PostgreSQL Database Linking
    print("\n[TEST 4] Verifying PostgreSQL Account Linking...")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, firebase_uid, is_active FROM users WHERE email IN ('admin@healthpulse.com', 'dr.satyadeep@healthpulse.com', 'shravan@healthpulse.com') ORDER BY role")
    users = cursor.fetchall()
    conn.close()
    for u in users:
        print(f" -> DB User: {u['email']} | Role: {u['role']} | Firebase UID: {u['firebase_uid']} | Active: {u['is_active']}")
        assert u["firebase_uid"] is not None and len(u["firebase_uid"]) > 0

    # 5. Cross-Role Login Block Enforcement (HTTP 403)
    print("\n[TEST 5] Cross-Role Portal Sign-in Blocking...")
    # Admin attempting to sign in via Patient Portal
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-admin:admin@healthpulse.com",
        "role": "patient"
    })
    print(f" -> Admin in Patient Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    # Patient attempting to sign in via Admin Portal
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-patient:shravan@healthpulse.com",
        "role": "admin"
    })
    print(f" -> Patient in Admin Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    # Doctor attempting to sign in via Patient Portal
    code, data = post("http://localhost:5000/api/auth/firebase-login", {
        "idToken": "mock-firebase-token-doctor:dr.satyadeep@healthpulse.com",
        "role": "patient"
    })
    print(f" -> Doctor in Patient Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    # 6. Inactive / Deactivated Account Blocking (HTTP 403)
    print("\n[TEST 6] Deactivated Account Access Blocking...")
    conn = get_db_connection()
    cursor = conn.cursor()
    # Find patient user id
    cursor.execute("SELECT id FROM users WHERE email = 'shravan@healthpulse.com'")
    shravan_user = cursor.fetchone()
    shravan_id = shravan_user["id"]
    
    # Deactivate account
    cursor.execute("UPDATE users SET is_active = FALSE WHERE id = ?", (shravan_id,))
    conn.commit()
    conn.close()
    print(" -> Temporarily set shravan@healthpulse.com is_active = FALSE in DB")

    try:
        # Attempt Firebase login while deactivated
        code, data = post("http://localhost:5000/api/auth/firebase-login", {
            "idToken": "mock-firebase-token-patient:shravan@healthpulse.com",
            "role": "patient"
        })
        print(f" -> Deactivated user login response: HTTP {code} ({data.get('error')})")
        assert code == 403, f"Expected 403 for deactivated account, got {code}"

        # Attempt Bearer token request on protected endpoint while deactivated
        code, data = get("http://localhost:5000/api/auth/me", {
            "Authorization": "Bearer mock-firebase-token-patient:shravan@healthpulse.com"
        })
        print(f" -> Deactivated user /api/auth/me response: HTTP {code} ({data.get('error')})")
        assert code == 403, f"Expected 403 for deactivated account token request, got {code}"
    finally:
        # Re-activate account to restore original state
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = TRUE WHERE id = ?", (shravan_id,))
        conn.commit()
        conn.close()
        print(" -> Restored shravan@healthpulse.com is_active = TRUE in DB")

    # 7. Endpoint Role Enforcement (HTTP 403)
    print("\n[TEST 7] Endpoint Role Enforcement...")
    # Patient accessing /api/admin/users -> 403
    code, data = get("http://localhost:5000/api/admin/users", {
        "Authorization": "Bearer mock-firebase-token-patient:shravan@healthpulse.com"
    })
    print(f" -> Patient token accessing /api/admin/users: HTTP {code} ({data.get('error')})")
    assert code == 403

    # Admin accessing /api/admin/users -> 200
    code, data = get("http://localhost:5000/api/admin/users", {
        "Authorization": f"Bearer {admin_token}"
    })
    user_count = len(data) if isinstance(data, list) else len(data.get('users', []))
    print(f" -> Admin token accessing /api/admin/users: HTTP {code} (Total users: {user_count})")
    assert code == 200

    # 8. Account Linking Endpoint
    print("\n[TEST 8] Account Linking Endpoint (/api/auth/account-link)...")
    code, data = post("http://localhost:5000/api/auth/account-link", {
        "firebase_uid": "firebase_verified_admin_uid_777"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    print(f" -> Admin account link response: HTTP {code} ({data.get('message')})")
    assert code == 200

    print("\n====================================================================")
    print("ALL 8 COMPREHENSIVE INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY!")
    print("====================================================================")

if __name__ == "__main__":
    run_tests()
