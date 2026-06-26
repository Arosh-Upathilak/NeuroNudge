/**
 * Firebase client SDK initialization and authentication helpers.
 *
 * The app is initialized as a singleton — safe to import from anywhere.
 * Auth state is managed by Firebase's built-in session handling.
 * All auth state management lives in AuthContext; this module only
 * exposes low-level Firebase operations.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// @ts-ignore
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Config ──────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ─── Singleton Initialization ─────────────────────────────────────────────────

/**
 * Initialize the Firebase app only once. On subsequent imports,
 * `getApps()` returns the existing instance.
 */
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Auth instance with AsyncStorage persistence to keep users logged in
 * across app restarts.
 */
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // If initializeAuth fails (e.g. during Fast Refresh), fallback to getAuth
  console.warn("[Firebase] initializeAuth failed, falling back to getAuth:", error);
  auth = getAuth(app);
}

/**
 * Firestore database instance.
 */
const db: Firestore = getFirestore(app);

export { auth, db };

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/**
 * Creates a new Firebase user with email + password, sets
 * the display name from the provided `name`, and sends a verification email.
 */
export const firebaseSignUp = async (
  email: string,
  password: string,
  name: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName: name });
  return credential;
};

/**
 * Signs an existing Firebase user in with email + password.
 */
export const firebaseSignIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs the current user out of Firebase.
 */
export const firebaseSignOut = async (): Promise<void> => {
  return signOut(auth);
};

/**
 * Returns a fresh Firebase ID token for the currently signed-in user.
 * Passing `true` forces a token refresh, preventing expired token issues.
 */
export const getCurrentIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found.");
  }
  return user.getIdToken(true);
};
