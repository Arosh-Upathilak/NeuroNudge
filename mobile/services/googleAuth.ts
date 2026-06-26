/**
 * Google Sign-In native platform helper.
 * Uses @react-native-google-signin/google-signin and Firebase's signInWithCredential.
 */
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, type UserCredential } from "firebase/auth";
import { auth } from "./firebase";

// Configure Google Sign-In using the Web Client ID (needed for ID token exchange)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

/**
 * Initiates the native Google sign-in flow and returns a Firebase UserCredential.
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Check if play services are available (mostly for Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Initiate sign in
    const signInResult = await GoogleSignin.signIn();

    // Handle token format in newer version of GoogleSignin
    const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

    if (!idToken) {
      throw new Error("Google Sign-In failed: No ID token returned from Google.");
    }

    // Authenticate with Firebase using Google ID Token
    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error: any) {
    // Check if the user cancelled the flow
    if (error.code === "SIGN_IN_CANCELLED" || error.message?.includes("developer error") === false && (error as any).code === "12501") {
      throw new Error("Google Sign-In was cancelled.");
    }
    throw error;
  }
};
