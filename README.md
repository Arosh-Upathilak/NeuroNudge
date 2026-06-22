# NeuroNudge

NeuroNudge is a full-stack application consisting of a Node.js/TypeScript backend API and a React Native (Expo) mobile application.

## Project Structure

```text
NeuroNudge/
├── backend/          # Node.js + TypeScript Backend
├── mobile/           # React Native Expo Mobile App
└── README.md
```

---

# Prerequisites

Before running the project, ensure the following are installed:

* Node.js (v20 or later recommended)
* npm
* Git
* Expo CLI (for mobile development)

Verify installation:

```bash
node -v
npm -v
git --version
```

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
```

### Environment Variables

| Variable | Description                     |
| -------- | ------------------------------- |
| PORT     | Port used by the backend server |
| FIREBASE_PROJECT_ID | Firebase Project ID |
| FIREBASE_CLIENT_EMAIL | Firebase Service Account Client Email |
| FIREBASE_PRIVATE_KEY | Firebase Service Account Private Key (escaped newlines) |
| FIREBASE_WEB_API_KEY | Firebase Web API Key for OAuth token exchange |

---

## Authentication

NeuroNudge uses a composed, robust API Gateway Authentication middleware leveraging **Firebase Authentication**. It supports both Firebase-issued ID tokens (JWTs) and third-party OAuth access/ID tokens (Google, Facebook, etc.).

### Composed Middleware: `apiGatewayAuth`

The gateway middleware (`apiGatewayAuth`) automatically detects the auth type based on request headers:

1. **Standard JWT Verification (Default)**:
   - Header: `Authorization: Bearer <firebase_id_token>`
   - The token is verified against the Firebase Admin SDK. Token revocation checks are enabled.

2. **OAuth Provider Token Exchange**:
   - Header: `Authorization: Bearer <provider_oauth_token>`
   - Header: `x-oauth-provider: <provider_id>` (e.g. `google.com`, `facebook.com`)
   - The provider token is securely exchanged via Firebase's Identity Toolkit REST API for a Firebase token, verified, and mapped to the user.

### Usage in Routes

```typescript
import { Router } from "express";
import { apiGatewayAuth } from "../middleware/auth";

const router = Router();

// 1. Any authenticated user can access:
router.get("/profile", apiGatewayAuth(), profileHandler);

// 2. Only users with the 'admin' scope custom claim can access:
router.get("/admin", apiGatewayAuth(["admin"]), adminHandler);
```

### Request Context

Once authenticated, user information is attached to the request object as `req.user` (typed via `AuthRequest` interface):

```typescript
export interface AuthPayload {
  uid: string;
  email?: string;
  name?: string;
  scopes: string[];
  providerId: string;
}
```

### Standalone Middleware: `appCheck`

To lock down API endpoints so they can only be consumed from your official Android/iOS application installations (preventing unauthorized external scripts or Postman calls), apply the standalone `appCheck` middleware:

1. **Header Requirement**:
   - Every request must supply the header `X-Firebase-AppCheck: <token>` containing a valid token generated on the client by Firebase App Check (e.g. via Play Integrity on Android or DeviceCheck/App Attest on iOS).
2. **Local Development & Automated Test Bypass**:
   - Configure the environment variable `APP_CHECK_BYPASS_TOKEN` in your local `.env`.
   - When the client sends a matching token in the `X-Firebase-AppCheck` header, the backend skips native signature verification, facilitating seamless local execution and testing.

#### Usage in Routes

```typescript
import { Router } from "express";
import { apiGatewayAuth, appCheck } from "../middleware/auth";

const router = Router();

// Secure the route with both App Check (app attestation) and User Auth:
router.get("/profile", appCheck, apiGatewayAuth(), profileHandler);
```

---

## Run Backend

Development mode:

```bash
npm run dev
```

Type checking:

```bash
npm run type-check
```

Lint project:

```bash
npm run lint
```

Fix lint issues:

```bash
npm run lint:fix
```

Build project:

```bash
npm run build
```

Start production build:

```bash
npm start
```

Backend runs at:

```text
http://localhost:5000
```

---

# Mobile Setup

Navigate to mobile directory:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file if required.

Example:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

---

## Run Mobile Application

Start Expo:

```bash
npm start
```

or

```bash
npx expo start
```

Run Android:

```bash
npm run android
```

Run iOS:

```bash
npm run ios
```

Run Web:

```bash
npm run web
```

---

# Technology Stack

## Backend

* Node.js
* Express.js
* TypeScript
* ESLint
* dotenv

## Mobile

* React Native
* Expo
* TypeScript
* Expo Router

---

# Development Workflow

1. Clone repository

```bash
git clone <repository-url>
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install mobile dependencies

```bash
cd ../mobile
npm install
```

4. Configure environment variables

5. Start backend server

```bash
cd backend
npm run dev
```

6. Start mobile application

```bash
cd mobile
npm start
```

---

# Git Guidelines

* Never commit `.env` files.
* Keep `.env.example` updated with all required variables.
* Create feature branches for new development.
* Submit pull requests for code review.

---

# Author

Developed as part of the NeuroNudge project.
