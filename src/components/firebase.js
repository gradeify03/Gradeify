// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxkrp1oAiVXnfck-fMUrUvsGuBowx4ipA",
  authDomain: "gradeify-8254e.firebaseapp.com",
  projectId: "gradeify-8254e",
  storageBucket: "gradeify-8254e.firebasestorage.app",
  messagingSenderId: "568317331012",
  appId: "1:568317331012:web:d438e4d08194b8696f1e11",
  measurementId: "G-VQLW7149KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Add and export auth, provider, and firestore for Google sign-in
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);