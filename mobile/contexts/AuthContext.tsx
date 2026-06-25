/**
 * AuthContext – single source of truth for authentication state.
 *
 * Provider order in _layout.tsx:
 *   ThemeProvider → DrawerProvider → NotificationProvider → AuthProvider
 *
 * Exposes:
 *   - `user`      : the signed-in Firebase user (or null)
 *   - `isLoading` : true while the initial auth state is being resolved
 *   - `signIn`    : Firebase sign-in + backend login
 *   - `signUp`    : Firebase user creation + backend registration (with rollback)
 *   - `signOut`   : Firebase sign-out
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type PropsWithChildren,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  firebaseSignIn,
  firebaseSignUp,
  firebaseSignOut,
  firebaseSendEmailVerification,
} from "../services/firebase";
import { syncUser } from "../services/api";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Firebase error code → friendly message mapping ──────────────────────────

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests":
    "Too many failed attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Please check your connection.",
};

/**
 * Maps a Firebase auth error to a human-readable message.
 */
const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? "";
  return (
    AUTH_ERROR_MESSAGES[code] ??
    (error as Error)?.message ??
    "An unexpected error occurred."
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Subscribe to Firebase auth state changes on mount.
  // Firebase resolves the persisted session from AsyncStorage automatically.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Signs in with Firebase. If verified, syncs with the backend.
   * Throws a friendly error message on failure.
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const credential = await firebaseSignIn(email, password);
        // Only sync with backend if email is verified
        if (credential.user.emailVerified) {
          await syncUser();
        }
      } catch (error) {
        throw new Error(getAuthErrorMessage(error));
      }
    },
    []
  );

  /**
   * Creates a Firebase user, updates their display name, and sends a
   * verification email. DOES NOT register in the backend DB yet.
   * Throws a friendly error message on failure.
   */
  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<void> => {
      let firebaseCreated = false;
      try {
        await firebaseSignUp(email, password, name);
        firebaseCreated = true;
        // Immediately synchronize in backend with isVerified: false
        await syncUser();
      } catch (error) {
        // Rollback: delete Firebase user if backend synchronization failed.
        if (firebaseCreated && auth.currentUser) {
          try {
            await auth.currentUser.delete();
          } catch (deleteError) {
            console.error(
              "[AuthContext] Failed to rollback Firebase user:",
              deleteError
            );
          }
        }
        throw new Error(getAuthErrorMessage(error));
      }
    },
    []
  );

  /**
   * Reloads the Firebase user to check the latest email verification status.
   * If verified, it synchronizes the user in the backend.
   */
  const reloadUser = useCallback(async (): Promise<void> => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        
        // Update local state to reflect the new emailVerified status
        const isVerified = auth.currentUser.emailVerified;
        setUser((prev) => prev ? { ...prev, emailVerified: isVerified } : null);

        // If newly verified, synchronize them in the backend database
        if (isVerified) {
          await syncUser();
        }
      }
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  /**
   * Resends the verification email.
   */
  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    try {
      await firebaseSendEmailVerification();
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  /**
   * Signs the current user out of Firebase.
   * The `onAuthStateChanged` listener will set `user` to null automatically.
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut();
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      reloadUser,
      resendVerificationEmail,
    }),
    [user, isLoading, signIn, signUp, signOut, reloadUser, resendVerificationEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Consumes the AuthContext. Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
