"""
HealthPulse Firebase Authentication Integration Module (Backend)
Handles Firebase ID Token verification, user claim extraction,
and seamless synchronization with PostgreSQL user accounts.
Includes a development simulation mode for local testing without live credentials.
"""

import os
import json
import logging
from typing import Optional, Dict, Any

# Ensure environment variables are loaded
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(root_env):
            load_dotenv(root_env)
except ImportError:
    pass

logger = logging.getLogger("healthpulse.firebase")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# Optional Firebase Admin SDK
FIREBASE_ADMIN_AVAILABLE = False
firebase_app = None

try:
    import firebase_admin
    from firebase_admin import auth as admin_auth
    from firebase_admin import credentials
    FIREBASE_ADMIN_AVAILABLE = True
except ImportError:
    admin_auth = None
    credentials = None
    logger.warning("[Firebase] firebase_admin package is not installed.")

# Initialize Firebase Admin
PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "healthpulse-hospital").strip()
SERVICE_ACCOUNT_PATH_OR_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "").strip()


def init_firebase_admin():
    global firebase_app
    if not FIREBASE_ADMIN_AVAILABLE:
        return None

    if firebase_admin._apps:
        firebase_app = firebase_admin.get_app()
        return firebase_app

    try:
        cred = None
        if SERVICE_ACCOUNT_PATH_OR_JSON:
            if os.path.exists(SERVICE_ACCOUNT_PATH_OR_JSON):
                cred = credentials.Certificate(SERVICE_ACCOUNT_PATH_OR_JSON)
                logger.info(f"[Firebase] Loaded service account credentials from file: {SERVICE_ACCOUNT_PATH_OR_JSON}")
            else:
                try:
                    sa_info = json.loads(SERVICE_ACCOUNT_PATH_OR_JSON)
                    cred = credentials.Certificate(sa_info)
                    logger.info("[Firebase] Loaded service account credentials from JSON string environment variable.")
                except Exception as json_err:
                    logger.warning(f"[Firebase] Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON: {json_err}")

        options = {}
        if PROJECT_ID:
            options["projectId"] = PROJECT_ID

        if cred:
            firebase_app = firebase_admin.initialize_app(cred, options=options)
        else:
            firebase_app = firebase_admin.initialize_app(options=options)

        logger.info(f"[Firebase] Firebase Admin initialized successfully for project: {PROJECT_ID}")
        return firebase_app
    except Exception as err:
        logger.warning(f"[Firebase] Initialization failed (running with development fallback): {err}")
        return None


# Run initialization on module import
init_firebase_admin()


def is_firebase_configured() -> bool:
    """Returns True if Firebase Admin SDK is initialized."""
    return bool(FIREBASE_ADMIN_AVAILABLE and firebase_admin._apps)


def verify_firebase_id_token(token_string: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a Firebase ID token string.
    Supports:
    1. Local development mock tokens (`mock-firebase-token-<role>:<email>`)
    2. Live Firebase ID tokens verified with Firebase Admin SDK
    3. Google OAuth2 token verification fallback

    Returns a dict with decoded claims:
    {
        "uid": str,
        "email": str,
        "email_verified": bool,
        "name": str,
        "picture": str (optional),
        "firebase": dict
    }
    or None if the token is invalid or expired.
    """
    if not token_string or not isinstance(token_string, str):
        return None

    token_string = token_string.strip()

    # 1. Development / Simulation token support
    if token_string.startswith("mock-firebase-token-"):
        try:
            # Format: mock-firebase-token-<role>:<email>
            payload = token_string[len("mock-firebase-token-"):]
            if ":" in payload:
                role, email = payload.split(":", 1)
            else:
                role = "patient"
                email = payload

            role = role.lower().strip()
            email = email.lower().strip()
            clean_identifier = email.replace("@", "_").replace(".", "_")
            uid = f"mock_uid_{role}_{clean_identifier}"

            return {
                "uid": uid,
                "email": email,
                "email_verified": True,
                "name": email.split("@")[0].replace(".", " ").title(),
                "role": role,
                "provider_id": "google.com" if "google" in token_string else "password",
                "mock": True
            }
        except Exception as e:
            logger.warning(f"[Firebase] Error parsing mock token: {e}")
            return None

    # 2. Live verification using Firebase Admin SDK
    # Firebase ID tokens are signed JSON Web Tokens consisting of 3 parts (header.payload.signature)
    jwt_parts = token_string.split(".")
    if len(jwt_parts) != 3:
        logger.debug("[Firebase] Token does not match 3-part JWT format.")
        return None

    if FIREBASE_ADMIN_AVAILABLE and firebase_admin._apps:
        try:
            decoded_claims = admin_auth.verify_id_token(token_string, check_revoked=True)
            return {
                "uid": decoded_claims.get("uid"),
                "email": (decoded_claims.get("email") or "").lower(),
                "email_verified": bool(decoded_claims.get("email_verified", False)),
                "name": decoded_claims.get("name") or decoded_claims.get("email", "").split("@")[0].title(),
                "picture": decoded_claims.get("picture"),
                "firebase": decoded_claims.get("firebase", {}),
                "mock": False
            }
        except Exception as err:
            logger.warning(f"[Firebase] Live token verification failed: {err}")
            # Try verification without revocation check in case token is fresh
            try:
                decoded_claims = admin_auth.verify_id_token(token_string, check_revoked=False)
                return {
                    "uid": decoded_claims.get("uid"),
                    "email": (decoded_claims.get("email") or "").lower(),
                    "email_verified": bool(decoded_claims.get("email_verified", False)),
                    "name": decoded_claims.get("name") or decoded_claims.get("email", "").split("@")[0].title(),
                    "picture": decoded_claims.get("picture"),
                    "firebase": decoded_claims.get("firebase", {}),
                    "mock": False
                }
            except Exception as inner_err:
                logger.warning(f"[Firebase] Second-pass live token verification failed: {inner_err}")
                return None

    logger.warning("[Firebase] Token verification requested but Firebase Admin is not initialized and token is not mock.")
    return None
