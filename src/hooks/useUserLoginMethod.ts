import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getUserLoginMethod, getUserDetails, UserLoginData } from '../lib/authUtils';

export const useUserLoginMethod = () => {
  const [loginMethod, setLoginMethod] = useState<'google' | 'manual' | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserLoginData | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set loading to false immediately to show dashboard
        setLoading(false);
        
        // Load user details in background (non-blocking)
        try {
          // Get user details in one query instead of two separate calls
          const details = await getUserDetails(firebaseUser.uid);
          if (details) {
            setUserDetails(details);
            setLoginMethod(details.loginMethod);
          } else {
            // Create fallback user details from Firebase user
            const loginMethod = firebaseUser.providerData.length > 0 ? 'google' : 'manual' as const;
            const fallbackDetails: UserLoginData = {
              firstName: firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: firebaseUser.email || '',
              loginMethod,
              createdAt: new Date()
            };
            setUserDetails(fallbackDetails);
            setLoginMethod(loginMethod);
          }
        } catch (error) {
          console.error('Error getting user details:', error);
          // Create fallback user details from Firebase user
          const loginMethod = firebaseUser.providerData.length > 0 ? 'google' : 'manual' as const;
          const fallbackDetails: UserLoginData = {
            firstName: firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0] || 'User',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: firebaseUser.email || '',
            loginMethod,
            createdAt: new Date()
          };
          setUserDetails(fallbackDetails);
          setLoginMethod(loginMethod);
        }
      } else {
        setLoginMethod(null);
        setUserDetails(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    loginMethod,
    loading,
    user,
    userDetails,
    isGoogleUser: loginMethod === 'google',
    isManualUser: loginMethod === 'manual',
  };
}; 