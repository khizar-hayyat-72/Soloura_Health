// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as authService from '@/lib/auth';
import type { User as FirebaseUserType } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<FirebaseUserType | false>;
  signup: (email: string, name: string, password?: string) => Promise<User | false>;
  logout: () => Promise<void | false>;
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
        // router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const loginUser = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const firebaseUser = await authService.login(email, password);
      if (firebaseUser) {
        router.push('/dashboard');
        return firebaseUser;
      }
      return false;
    } catch (error: any) {
      console.error("[AuthHook] Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const signupUser = useCallback(async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    try {
      const signedUpUser = await authService.signup(email, name, password);
      if (signedUpUser) {
        router.push('/login');
        return signedUpUser;
      }
      return false;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("An account with this email already exists.");
      }
      console.error("[AuthHook] Signup failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logoutUser = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      router.push('/login');
    } catch (error: any) {
      console.error("[AuthHook] Logout failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    user,
    isLoading,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser
  };
}
