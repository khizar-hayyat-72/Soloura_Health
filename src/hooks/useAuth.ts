
// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as authService from '@/lib/auth';
import type { User as FirebaseUserType } from 'firebase/auth'; // Import FirebaseUser type

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<FirebaseUserType | null>; // Updated return type
  signup: (email: string, name: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setIsLoading(false);
      if (!authUser && !['/login', '/signup'].includes(window.location.pathname)) {
        // router.replace('/login'); // Consider if this is too aggressive
      }
    });
    return () => unsubscribe();
  }, []);

  const loginUser = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // authService.login now returns FirebaseUserType or throws an error
      const firebaseUser = await authService.login(email, password);
      // onAuthStateChanged will eventually update the user state with the full profile from Firestore.
      // We can navigate upon successful Firebase auth at the Firebase level.
      if (firebaseUser) {
        router.push('/dashboard');
      }
      return firebaseUser; // Return the FirebaseUserType from firebase/auth
    } catch (error: any) {
      console.error("[AuthHook] Login failed:", error);
      setIsLoading(false); // Ensure loading is false on error
      throw error;
    }
    // setIsLoading(false) will be handled by onAuthStateChanged effect after profile is processed.
  }, [router]);

  const signupUser = useCallback(async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    try {
      const signedUpUser = await authService.signup(email, name, password);
      router.push('/login'); 
      return signedUpUser;
    } catch (error: any) {
      console.error("[AuthHook] Signup failed:", error);
      setIsLoading(false);
      throw error;
    }
  }, [router]);

  const logoutUser = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      router.push('/login');
    } catch (error: any) {
      console.error("[AuthHook] Logout failed:", error);
      setIsLoading(false);
    }
  }, [router]);

  return { user, isLoading, login: loginUser, signup: signupUser, logout: logoutUser };
}
