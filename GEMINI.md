# HealthPulse Development & Testing Rules (GEMINI.md)

## 1. System Services & Architecture
- **Frontend**: React (Vite) on `http://localhost:5173`
- **Backend**: Python Flask on `http://localhost:5000`
- **Database**: PostgreSQL (Neon cloud) via `DATABASE_URL` with local SQLite fallback
- **Authentication**: Native Flask session tokens + Werkzeug PBKDF2 hashing (`users` and `user_tokens` tables in PostgreSQL). No Firebase dependencies.

## 2. Autonomous "test e2e" Workflow
Whenever the user prompts with **"test e2e"** or requests end-to-end verification:

1. **Autonomous Action First**:
   - Diagnose, edit, fix, and verify code issues autonomously. Do not ask for user confirmation for changes or tool calls that can be executed directly with available capabilities.
   - If an external platform or service is needed that has an available MCP server, plugin, or API key, configure and utilize it directly. Only request user action if a credential, external login, or platform setting must be provided manually.

2. **Server Availability Check**:
   - Ensure both the Flask backend (`http://localhost:5000`) and the Vite frontend (`http://localhost:5173`) are running and healthy.
   - Test basic API connectivity (`GET /api/system/database-status` or `GET /api/auth/me`).

3. **Capture "Before" State & Diagnostics**:
   - Record the existing failure or UI state before applying fixes.
   - Use headless Chrome (`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`) or the Chrome DevTools MCP tools to inspect errors and capture snapshots.

4. **Execute Native Test Suite**:
   - Run `python backend/test_native_auth.py` to verify all 10 core security scenarios:
     - Admin, Doctor, and Patient logins
     - Invalid credentials rejection (HTTP 401)
     - Cross-portal sign-in blocks (HTTP 403)
     - Session verification & token invalidation on logout
     - Inactive account deactivation blocking (HTTP 403)
     - Endpoint role protection (Admin vs. Doctor vs. Patient)

5. **Capture "After" State & Visual Proof**:
   - Once all fixes are applied, verify the working UI and capture an "After" screenshot.

6. **Create Walkthrough Artifact**:
   - Create or update a `walkthrough.md` artifact in the conversation artifact directory (`<appDataDir>/brain/<conversation-id>/walkthrough.md`).
   - Include:
     - Before & After screenshot visual comparisons.
     - Test result tables and endpoints verified.
     - Clear list of changes made.
     - Exact status of the database and servers.
