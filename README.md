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
