import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Fast-fail check for startup
if (process.env.NODE_ENV !== "test") {
  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Critical: Missing Firebase configuration variables. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
    process.exit(1);
  }
}

let authInstance: Auth;

if (process.env.NODE_ENV === "test") {
  // Safe default for tests, will be mocked
  authInstance = {} as Auth;
} else {
  // Format private key (replace literal \n with actual newlines)
  const formattedPrivateKey = privateKey!.replace(/\\n/g, "\n");

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
  }
  authInstance = getAuth();
}

export const auth = authInstance;
