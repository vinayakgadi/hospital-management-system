import urllib.request
import urllib.error
import json
import sys
import os
import functools

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
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
    print("HEALTHPULSE NATIVE POSTGRESQL & FLASK AUTHENTICATION TEST SUITE")
    print("====================================================================")

    # 1. Admin Authentication
    print("\n[TEST 1] Admin Native Authentication (POST /api/auth/login)...")
    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "admin@healthpulse.com",
        "password": "admin123",
        "role": "admin"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Role: {data.get('role')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "admin"
    assert data.get("token") is not None
    admin_token = data.get("token")

    # 2. Doctor Authentication
    print("\n[TEST 2] Doctor Native Authentication (POST /api/auth/login)...")
    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "dr.satyadeep@healthpulse.com",
        "password": "doctor123",
        "role": "doctor"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Doctor ID: {data.get('user', {}).get('doctor_id')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "doctor"
    assert data.get("user", {}).get("doctor_id") is not None
    doctor_token = data.get("token")

    # 3. Patient Authentication
    print("\n[TEST 3] Patient Native Authentication (POST /api/auth/login)...")
    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "shravan@healthpulse.com",
        "password": "patient123",
        "role": "patient"
    })
    print(f" -> Status: {code}, Message: {data.get('message')}, Patient ID: {data.get('user', {}).get('patient_id')}")
    assert code == 200, f"Expected 200, got {code}"
    assert data.get("role") == "patient"
    assert data.get("user", {}).get("patient_id") is not None
    patient_token = data.get("token")

    # 4. Invalid Credentials Rejection
    print("\n[TEST 4] Invalid Credentials Handling...")
    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "admin@healthpulse.com",
        "password": "wrong-password-999",
        "role": "admin"
    })
    print(f" -> Bad password: HTTP {code} ({data.get('error')})")
    assert code == 401

    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "nonexistent.user@healthpulse.com",
        "password": "password123",
        "role": "patient"
    })
    print(f" -> Nonexistent user: HTTP {code} ({data.get('error')})")
    assert code == 401

    # 5. Cross-Role Portal Sign-in Blocking (HTTP 403)
    print("\n[TEST 5] Cross-Role Portal Sign-in Blocking...")
    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "admin@healthpulse.com",
        "password": "admin123",
        "role": "patient"
    })
    print(f" -> Admin in Patient Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "shravan@healthpulse.com",
        "password": "patient123",
        "role": "admin"
    })
    print(f" -> Patient in Admin Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    code, data = post("http://localhost:5000/api/auth/login", {
        "email": "dr.satyadeep@healthpulse.com",
        "password": "doctor123",
        "role": "patient"
    })
    print(f" -> Doctor in Patient Portal: HTTP {code} ({data.get('error')})")
    assert code == 403

    # 6. Session Verification (GET /api/auth/me)
    print("\n[TEST 6] Session Recovery & Bearer Token Verification...")
    code, data = get("http://localhost:5000/api/auth/me", {
        "Authorization": f"Bearer {admin_token}"
    })
    print(f" -> /api/auth/me with Admin Token: HTTP {code}, Authenticated: {data.get('authenticated')}, Role: {data.get('role')}")
    assert code == 200
    assert data.get("authenticated") is True
    assert data.get("role") == "admin"

    # Missing token -> 401
    code, data = get("http://localhost:5000/api/auth/me")
    print(f" -> /api/auth/me without token: HTTP {code} ({data.get('error')})")
    assert code == 401

    # Invalid token -> 401
    code, data = get("http://localhost:5000/api/auth/me", {
        "Authorization": "Bearer invalid_nonexistent_token_123"
    })
    print(f" -> /api/auth/me with invalid token: HTTP {code} ({data.get('error')})")
    assert code == 401

    # 7. Inactive Account Access Blocking & Session Revocation
    print("\n[TEST 7] Deactivated Account Access Blocking...")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = 'shravan@healthpulse.com'")
    shravan_user = cursor.fetchone()
    shravan_id = shravan_user["id"]

    # Temporarily deactivate account
    cursor.execute("UPDATE users SET is_active = FALSE WHERE id = ?", (shravan_id,))
    conn.commit()
    conn.close()
    print(" -> Temporarily set shravan@healthpulse.com is_active = FALSE in PostgreSQL")

    try:
        # Attempt login while deactivated
        code, data = post("http://localhost:5000/api/auth/login", {
            "email": "shravan@healthpulse.com",
            "password": "patient123",
            "role": "patient"
        })
        print(f" -> Deactivated user login response: HTTP {code} ({data.get('error')})")
        assert code == 403

        # Attempt API request with previous token
        code, data = get("http://localhost:5000/api/auth/me", {
            "Authorization": f"Bearer {patient_token}"
        })
        print(f" -> Deactivated user token request response: HTTP {code} ({data.get('error')})")
        assert code in (401, 403)
    finally:
        # Restore active state
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = TRUE WHERE id = ?", (shravan_id,))
        conn.commit()
        conn.close()
        print(" -> Restored shravan@healthpulse.com is_active = TRUE in PostgreSQL")

    # 8. Role-Based Protected Endpoints
    print("\n[TEST 8] Role-Based Endpoint Protection...")
    # Issue a fresh patient token
    _, p_login = post("http://localhost:5000/api/auth/login", {
        "email": "shravan@healthpulse.com",
        "password": "patient123",
        "role": "patient"
    })
    fresh_patient_token = p_login.get("token")

    # Patient accessing /api/admin/users -> 403
    code, data = get("http://localhost:5000/api/admin/users", {
        "Authorization": f"Bearer {fresh_patient_token}"
    })
    print(f" -> Patient token accessing /api/admin/users: HTTP {code} ({data.get('error')})")
    assert code == 403

    # Doctor accessing /api/admin/users -> 403
    code, data = get("http://localhost:5000/api/admin/users", {
        "Authorization": f"Bearer {doctor_token}"
    })
    print(f" -> Doctor token accessing /api/admin/users: HTTP {code} ({data.get('error')})")
    assert code == 403

    # Admin accessing /api/admin/users -> 200
    code, data = get("http://localhost:5000/api/admin/users", {
        "Authorization": f"Bearer {admin_token}"
    })
    total = len(data) if isinstance(data, list) else len(data.get("users", []))
    print(f" -> Admin token accessing /api/admin/users: HTTP {code} (Total users: {total})")
    assert code == 200

    # 9. Password Change Endpoint
    print("\n[TEST 9] Password Change Endpoint (/api/auth/change-password)...")
    # Bad current password -> 400
    code, data = post("http://localhost:5000/api/auth/change-password", {
        "current_password": "wrong-current-password",
        "new_password": "patient_new_password_123"
    }, headers={"Authorization": f"Bearer {fresh_patient_token}"})
    print(f" -> Wrong current password: HTTP {code} ({data.get('error')})")
    assert code == 400

    # Valid current password -> 200
    code, data = post("http://localhost:5000/api/auth/change-password", {
        "current_password": "patient123",
        "new_password": "patient_new_password_123"
    }, headers={"Authorization": f"Bearer {fresh_patient_token}"})
    print(f" -> Valid password update: HTTP {code} ({data.get('message')})")
    assert code == 200

    # Revert back to original password
    code, data = post("http://localhost:5000/api/auth/change-password", {
        "current_password": "patient_new_password_123",
        "new_password": "patient123"
    }, headers={"Authorization": f"Bearer {fresh_patient_token}"})
    print(f" -> Revert to original password: HTTP {code} ({data.get('message')})")
    assert code == 200

    # 10. Logout & Token Invalidation
    print("\n[TEST 10] Logout & Session Invalidation (POST /api/auth/logout)...")
    code, data = post("http://localhost:5000/api/auth/logout", {}, headers={
        "Authorization": f"Bearer {fresh_patient_token}"
    })
    print(f" -> Logout response: HTTP {code} ({data.get('message')})")
    assert code == 200

    # Token must now be invalidated
    code, data = get("http://localhost:5000/api/auth/me", {
        "Authorization": f"Bearer {fresh_patient_token}"
    })
    print(f" -> Invalidate token check on /api/auth/me: HTTP {code} ({data.get('error')})")
    assert code == 401

    print("\n====================================================================")
    print("ALL 10 NATIVE AUTHENTICATION TESTS PASSED SUCCESSFULLY!")
    print("====================================================================")

if __name__ == "__main__":
    run_tests()
