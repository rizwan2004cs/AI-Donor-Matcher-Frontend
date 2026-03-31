# Backend Contract: Auth and Profile

Last updated: 2026-03-31

## Purpose

Define the current authentication and profile contract used by the frontend.

## Auth Model

The frontend uses Firebase Email/Password.

Active backend auth endpoints:

- `POST /api/auth/firebase/register`
- `POST /api/auth/firebase/login`

Protected requests use:

```http
Authorization: Bearer <firebase-id-token>
```

## Profile Rules

- donor and admin identity is resolved from backend user payload
- NGO route access also depends on NGO approval and profile completion state
- frontend must fetch NGO profile after login when NGO-specific gating is needed

## Notes

- old OTP endpoints are deprecated for frontend work
- backend remains responsible for role, approval, and profile completion
