# Backend Contract — Auth, Registration & NGO Profile

> **Purpose:** This document describes exactly how the backend must handle registration, OTP verification, login, and NGO profile completion for the frontend to work correctly.

---

## 1. Registration (`POST /api/auth/register`)

### Request

**Donor (JSON):**
```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "password": "SecurePass123",
  "role": "DONOR"
}
```
- **Do not require or expect `location`.** The frontend no longer sends it.

**NGO (multipart/form-data):**
- `fullName`, `email`, `password`, `role` (value: `"NGO"`)
- `document` (optional file — PDF or image)
- **Do not require or expect `location`.** The frontend no longer sends it. NGOs set location later in profile completion.

### Response (201)

Return `token` and `user` so the frontend can auto-login immediately:

```json
{
  "message": "Registration successful. A verification code has been sent to your email.",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "fullName": "Rahul Kumar",
    "email": "rahul@gmail.com",
    "role": "DONOR",
    "emailVerified": false,
    "profileComplete": true
  }
}
```

- **Donors:** Always set `profileComplete: true` (they don’t have a completion flow).
- **NGOs:** Set `profileComplete: false` until they complete their profile (see §4).
- **Both:** Set `emailVerified: false` until OTP is verified.
- Send an OTP email to the user immediately after creating the account.

### Errors

- **409:** `{ "message": "Email already registered" }`
- **400 (NGO):** `{ "message": "Document upload required" }` — if you require the document for NGO registration

---

## 2. OTP Endpoints

### 2.1 Send OTP (`POST /api/auth/send-otp`)

```
Content-Type: application/json
{ "email": "rahul@gmail.com" }
```

**Response (200):** `{ "message": "Verification code sent" }`  
**Errors:**
- **404:** `{ "message": "Email not found" }`
- **400:** `{ "message": "Email already verified" }`  
- **429:** Rate limit if too many requests (e.g. `{ "message": "Too many requests. Try again later." }`)

### 2.2 Verify OTP (`POST /api/auth/verify-otp`)

```
Content-Type: application/json
{ "email": "rahul@gmail.com", "otp": "123456" }
```

**Response (200):** `{ "message": "Email verified" }`  
**Error (400):** `{ "message": "Invalid or expired code" }`

Optional: return `{ "message": "Email verified", "user": {...}, "token": "..." }` so the frontend can refresh the user without another login.

---

## 3. Login (`POST /api/auth/login`)

### Response (200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "fullName": "Rahul Kumar",
    "email": "rahul@gmail.com",
    "role": "DONOR",
    "emailVerified": true,
    "profileComplete": true
  }
}
```

- **Donors:** Always `profileComplete: true`.
- **NGOs:** `profileComplete: true` only when the profile is complete (see §4).
- `emailVerified: true` after successful OTP verification.

The frontend uses `profileComplete` to:
- Redirect NGOs with `profileComplete: false` to `/ngo/complete-profile`
- Redirect NGOs with `profileComplete: true` to `/ngo/dashboard`
- Decide whether to show "Dashboard" vs "Complete Profile" in the Navbar

---

## 4. NGO Profile Completion

### 4.1 Get Profile (`GET /api/ngo/profile`)

**Response (200):**
```json
{
  "organizationName": "Hope Foundation",
  "description": "We provide food and clothing...",
  "address": "12 Gandhi Road, Chennai",
  "latitude": "13.0827",
  "longitude": "80.2707",
  "profilePhotoUrl": "https://...",
  "verificationDocUrl": "https://...",
  "profileComplete": false
}
```

### 4.2 Update Profile (`PUT /api/ngo/profile`)

**Request:**
```json
{
  "organizationName": "Hope Foundation",
  "description": "We provide food and clothing...",
  "address": "12 Gandhi Road, Chennai",
  "latitude": "13.0827",
  "longitude": "80.2707"
}
```

**Response (200):** Return the updated profile object. Include `profileComplete: true` when all required fields are filled:
- `organizationName`, `description`, `address`, `latitude`, `longitude`, `profilePhotoUrl`, `verificationDocUrl`

### 4.3 Upload Endpoints

- `POST /api/ngo/profile-photo` — FormData with `file` (profile photo)  
  - Response: full profile object (including `profileComplete` if it becomes true)
- `POST /api/ngo/verification-doc` — FormData with `file` (verification document)  
  - Response: full profile object (including `profileComplete` if it becomes true)

---

## 5. Discovery / Map Filtering

**`GET /api/ngos`** and **`GET /api/ngos/:id`** must **only** return NGOs where:
- `emailVerified === true`
- `profileComplete === true`

This ensures NGOs appear on the discovery map only after they verify their email and complete their profile (including map location).

---

## Summary Checklist for Backend

| Endpoint | Change |
|----------|--------|
| `POST /api/auth/register` | Make `location` optional/removed; return `token` and `user` with `emailVerified: false`, `profileComplete: false` (NGO) or `profileComplete: true` (Donor); trigger OTP email on register |
| `POST /api/auth/send-otp` | Accept `{ email }`; send OTP; return 200 or 4xx with message |
| `POST /api/auth/verify-otp` | Accept `{ email, otp }`; set `emailVerified: true` on success |
| `POST /api/auth/login` | Include `profileComplete` in user object for NGOs |
| `GET /api/ngo/profile` | Include `profileComplete` |
| `PUT /api/ngo/profile` | Compute and return `profileComplete` when all required fields present |
| `POST /api/ngo/profile-photo`, `POST /api/ngo/verification-doc` | Return full profile with updated `profileComplete` |
| `GET /api/ngos`, `GET /api/ngos/:id` | Filter out NGOs where `emailVerified` or `profileComplete` is false |
