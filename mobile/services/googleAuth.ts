/**
 * Google Sign-In native platform helper.
 * Uses @react-native-google-signin/google-signin and Firebase's signInWithCredential.
 */
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

/**
 * Initiates the native Google sign-in flow and returns a Firebase UserCredential.
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    try {
      await GoogleSignin.signOut();
    } catch {
    }

    const signInResult = await GoogleSignin.signIn();

    const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

    if (!idToken) {
      throw new Error(
        "Google Sign-In failed: No ID token returned from Google.",
      );
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error: any) {
    if (
      error.code === "SIGN_IN_CANCELLED" ||
      (error.message?.includes("developer error") === false &&
        (error as any).code === "12501")
    ) {
      throw new Error("Google Sign-In was cancelled.");
    }
    throw error;
  }
};
