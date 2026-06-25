require("dotenv").config({ path: "./mobile/.env" });
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testSync() {
  try {
    const email = `test_${Date.now()}@example.com`;
    console.log("Creating user:", email);
    const credential = await createUserWithEmailAndPassword(auth, email, "password123");
    const token = await credential.user.getIdToken(true);
    console.log("Got token.");

    console.log("Hitting Vercel /api/user/sync...");
    const res = await fetch("https://neuronudge-backend.vercel.app/api/user/sync", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    const text = await res.text();
    console.log("Response status:", res.status);
    console.log("Response body:", text);

    await credential.user.delete();
    console.log("Cleaned up Firebase user.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSync();
