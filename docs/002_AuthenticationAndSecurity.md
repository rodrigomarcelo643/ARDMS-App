# 002 — Authentication & Security Subsystem

## 🔐 Architecture Overview
The MedSIS authentication subsystem enforces a multi-tier verification process consisting of **Credential Authentication**, **Two-Factor OTP Verification**, and **Institutional Policy Acceptance**.

```
+---------------+     +-----------------------+     +-----------------------+     +-------------------+
|  1. Login     | --> |  2. Email OTP 2FA     | --> |  3. Policy Acceptance | --> |  4. Main App Tabs |
| (ID/Password) |     | (6-Digit Dynamic Code)|     | (Institutional Terms) |     |  app/(tabs)/home  |
+---------------+     +-----------------------+     +-----------------------+     +-------------------+
```

---

## 🔑 Authentication Lifecycle

### 1. Primary Login (`app/auth/login.tsx`)
- Students provide their registered **Student ID / Email** and **Password**.
- The request posts to `${API_BASE_URL}/api/auth/login.php`.
- If the account is valid:
  - If 2FA is required: The backend generates a time-limited 6-digit numeric OTP, sends it to the student's email, and flags `requires_otp: true`.
  - The client transitions to `app/auth/otp-verification.tsx`.

### 2. Two-Factor OTP Verification (`app/auth/otp-verification.tsx`)
- Renders an interactive 6-cell numeric grid with auto-focus progression ([`OtpInputGrid.tsx`](file:///D:/DevApp/MedSIS-App/components/auth/otp/OtpInputGrid.tsx)).
- Supports code resend with a 60-second cooldown timer.
- Validates the token against `${API_BASE_URL}/api/auth/verify_otp.php`.

### 3. Policy Acceptance (`app/auth/policy-acceptance.tsx`)
- If the student has not yet agreed to institutional terms (`policy_accepted === false` / `0`), the app presents the institutional privacy terms.
- Acceptance triggers `${API_BASE_URL}/api/auth/accept_policy.php`, updating the database flag and persisting the state locally.

---

## 💾 Session Persistence & AuthContext (`contexts/AuthContext.tsx`)

The `AuthContext` provides global authentication state throughout the React tree:

```typescript
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}
```

### Storage Security:
- Session tokens and user payload are serialized into `@react-native-async-storage/async-storage` under key `@medsis_user_data` and `@medsis_auth_token`.
- On application launch, `index.tsx` checks for a valid persisted session. If valid, the user routes directly to `/(tabs)/home`; otherwise, they route to `/auth/login`.

---

## 🛡️ Password Recovery & Security Updates

1. **Forgot Password Flow (`app/auth/forgot-password.tsx`)**:
   - Submits email to receive a password reset OTP.
   - Verifies the OTP and unlocks the `reset-password.tsx` form.
2. **Password Requirement Validator (`PasswordRequirements.tsx`)**:
   - Minimum 8 characters.
   - At least 1 uppercase letter (`[A-Z]`).
   - At least 1 lowercase letter (`[a-z]`).
   - At least 1 numeric digit (`[0-9]`).
   - At least 1 special character (`[!@#$%^&*]`).
3. **In-App Password Modification (`app/screens/change-password.tsx`)**:
   - Authenticated students can modify credentials securely after verifying their current password and receiving a confirmation email alert.
