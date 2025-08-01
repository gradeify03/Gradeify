import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential 
} from "firebase/auth";
import { auth, db } from "../components/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * Sign in with email and password
 */
export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Save login method to Firestore if not already saved
    try {
      await saveUserLoginMethod(userCredential.user.uid, 'manual', {
        email: userCredential.user.email || email
      });
    } catch (firestoreError) {
      console.warn('Could not save login method to Firestore:', firestoreError);
    }
    
    return userCredential;
  } catch (error: any) {
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password.');
      case 'auth/invalid-email':
        throw new Error('Invalid email address.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error(error.message || 'Login failed. Please try again.');
    }
    }
};

// User data interface
export interface UserLoginData {
  firstName: string;
  lastName: string;
  email: string;
  loginMethod: 'google' | 'manual';
  createdAt: Date;
}



/**
 * Get user details from Firestore (optimized)
 */
export const getUserDetails = async (uid: string): Promise<UserLoginData | null> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    
    const userDocPromise = getDoc(doc(db, 'users', uid));
    const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any;
    
    if (userDoc.exists()) {
      return userDoc.data() as UserLoginData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
};

/**
 * Save user login method to Firestore
 */
export const saveUserLoginMethod = async (
  uid: string, 
  loginMethod: 'google' | 'manual',
  userData?: Partial<UserLoginData>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    // Use setDoc without merge for faster writes
    await setDoc(userRef, {
      loginMethod,
      createdAt: new Date(),
      ...userData
    });
  } catch (error) {
    console.error('Error saving user login method:', error);
    // Don't throw error to prevent registration failure
    // User can still login even if Firestore save fails
  }
};

/**
 * Check if email already exists in Firestore
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // First check if user exists in Firebase Auth
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
};

/**
 * Register with email and password
 */
export const registerWithEmailPassword = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<UserCredential> => {
  try {
    // Ultra-fast registration - only create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile only (Firestore can be done later if needed)
    try {
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
    } catch (profileError) {
      console.warn('Profile update failed, but registration succeeded:', profileError);
    }
    
    // Firestore operations can be done asynchronously later
    // This makes registration much faster
    saveUserLoginMethod(userCredential.user.uid, 'manual', {
      firstName,
      lastName,
      email
    }).catch(error => {
      console.warn('Firestore save failed, but registration succeeded:', error);
    });
    
    return userCredential;
  } catch (error: any) {
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('An account with this email already exists.');
      case 'auth/invalid-email':
        throw new Error('Invalid email address.');
      case 'auth/weak-password':
        throw new Error('Password should be at least 6 characters long.');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password accounts are not enabled. Please contact support.');
      default:
        throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
}; 

/**
 * Check if a user can use Google login based on their email
 */
export const canUserUseGoogleLogin = async (email: string): Promise<boolean> => {
  try {
    const exists = await checkEmailExists(email);
    if (!exists) {
      // New user - can use Google
      return true;
    }
    
    // Check if existing user was registered with Google
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.loginMethod === 'google';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Google login eligibility:', error);
    return false;
  }
}; 