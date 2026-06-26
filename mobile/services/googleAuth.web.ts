/**
 * Google Sign-In web platform helper.
 * Uses Firebase's signInWithPopup and GoogleAuthProvider.
 */
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Initiates the Firebase popup sign-in flow for Google and returns a UserCredential.
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google Sign-In popup was closed before completion.");
    }
    throw error;
  }
};
