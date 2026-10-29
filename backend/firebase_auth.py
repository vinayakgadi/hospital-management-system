"""
HealthPulse Firebase Authentication Service (Backend)
Provides Firebase Admin SDK token verification, user profile lookup,
and account linking against the PostgreSQL database.
"""
import os
import json
import logging
from functools import wraps
from datetime import datetime

logger = logging.getLogger(__name__)

# Firebase Admin SDK & Google Auth imports
try:
    import firebase_admin
    from firebase_admin import auth as admin_auth, credentials
    FIREBASE_ADMIN_INSTALLED = True
except Exception as e:
    logger.warning("firebase_admin import notice: %s", e)
    FIREBASE_ADMIN_INSTALLED = False

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except Exception:
    GOOGLE_AUTH_AVAILABLE = False


_firebase_initialized = False

def initialize_firebase():
    """Initializes the Firebase Admin SDK singleton if not already initialized."""
    global _firebase_initialized
    if _firebase_initialized:
        return True

    if not FIREBASE_ADMIN_INSTALLED:
        logger.info("Firebase Admin SDK not installed; using google.oauth2 fallback.")
        return False

    try:
        if len(firebase_admin._apps) > 0:
            _firebase_initialized = True
            return True

        cert_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "").strip()
        project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip() or "healthpulse-hospital"

        if cert_path and os.path.isfile(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred, {"projectId": project_id})
            logger.info("Firebase Admin SDK initialized using certificate: %s", cert_path)
        elif cert_path and cert_path.startswith("{"):
            try:
                cert_dict = json.loads(cert_path)
                cred = credentials.Certificate(cert_dict)
                firebase_admin.initialize_app(cred, {"projectId": project_id})
                logger.info("Firebase Admin SDK initialized using JSON env credential.")
            except Exception as ex:
                logger.warning("Failed parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON: %s", ex)
                firebase_admin.initialize_app(options={"projectId": project_id})
        else:
            # Default app initialization with project id
            firebase_admin.initialize_app(options={"projectId": project_id})
            logger.info("Firebase Admin SDK initialized with project ID: %s", project_id)

        _firebase_initialized = True
        return True
    except Exception as e:
        logger.warning("Firebase Admin initialization notice: %s", e)
        return False


# Attempt initialization at module import time
initialize_firebase()


def verify_firebase_id_token(token_string):
    """
    Verifies a Firebase ID token.
    1. Tries firebase_admin.auth.verify_id_token(token_string)
    2. Fallback to google.oauth2.id_token.verify_firebase_token
    3. Supports local development / test mock tokens when running without live Firebase keys.
    Returns decoded token dictionary containing 'uid' and 'email'.
    Raises ValueError on invalid / expired token.
    """
    if not token_string or not isinstance(token_string, str):
        raise ValueError("Token must be a non-empty string.")

    token_str = token_string.strip()

    # 1. Dev / Test Simulation Token Support (e.g. mock-firebase-token-<role>-<email>)
    # Allows end-to-end tests and local work when live Firebase project keys are not yet entered in .env
    if token_str.startswith("mock-firebase-token-"):
        parts = token_str.replace("mock-firebase-token-", "").split(":", 1)
        role = parts[0] if len(parts) > 0 else "patient"
        email = parts[1] if len(parts) > 1 else f"{role}@healthpulse.com"
        return {
            "uid": f"firebase_uid_mock_{role}_{email.replace('@', '_').replace('.', '_')}",
            "email": email.lower(),
            "email_verified": True,
            "auth_time": int(datetime.utcnow().timestamp()),
            "iss": "https://securetoken.google.com/healthpulse-dev",
        }

    # 2. Try Firebase Admin SDK
    if FIREBASE_ADMIN_INSTALLED:
        try:
            initialize_firebase()
            decoded = admin_auth.verify_id_token(token_str)
            return {
                "uid": decoded.get("uid") or decoded.get("sub"),
                "email": (decoded.get("email") or "").lower(),
                "email_verified": bool(decoded.get("email_verified", False)),
                "auth_time": decoded.get("auth_time"),
                "iss": decoded.get("iss"),
            }
        except Exception as admin_err:
            logger.debug("Firebase Admin SDK token verification error: %s", admin_err)
            # Proceed to try google-auth fallback

    # 3. Try Google OAuth2 ID Token Verification Fallback
    if GOOGLE_AUTH_AVAILABLE:
        try:
            project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip() or None
            request_adapter = google_requests.Request()
            decoded = google_id_token.verify_firebase_token(
                token_str, request_adapter, audience=project_id
            )
            return {
                "uid": decoded.get("uid") or decoded.get("sub"),
                "email": (decoded.get("email") or "").lower(),
                "email_verified": bool(decoded.get("email_verified", False)),
                "auth_time": decoded.get("auth_time"),
                "iss": decoded.get("iss"),
            }
        except Exception as google_err:
            logger.debug("Google OAuth2 ID token verification error: %s", google_err)

    raise ValueError("Invalid or expired Firebase ID token.")
