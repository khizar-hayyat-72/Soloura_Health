
// src/lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendEmailVerification,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from './types';

// Firestore collection for users
const USERS_COLLECTION = 'users';

export async function signup(email: string, name: string, password?: string): Promise<User> {
  if (!password) {
    throw new Error("Password is required for signup.");
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Send email verification
    await sendEmailVerification(firebaseUser);
    console.log('[Auth] Verification email sent.');

    // Create user profile in Firestore
    const userProfile: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: name,
      emailVerified: firebaseUser.emailVerified, // Store initial verification status
    };
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userProfile);
    console.log('[Auth] User signed up and profile created in Firestore:', userProfile);
    return userProfile;
  } catch (error: any) {
    console.error('[Auth] Error during signup:', error.message);
    throw error;
  }
}

export async function login(email: string, password?: string): Promise<FirebaseUser> {
  if (!password) {
    throw new Error("Password is required for login.");
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fallback: Ensure profile exists and emailVerified status is current in Firestore.
    // onAuthStateChanged is the primary source for the app's User state with full profile.
    const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn('[Auth] User profile not found in Firestore during login. Creating a basic one.');
      const newProfile: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: firebaseUser.displayName || email.split('@')[0],
        emailVerified: firebaseUser.emailVerified,
      };
      await setDoc(userDocRef, newProfile);
    } else {
      // If profile exists, ensure emailVerified status in Firestore matches Firebase Auth.
      const storedProfile = userDocSnap.data() as User;
      if (storedProfile.emailVerified !== firebaseUser.emailVerified) {
        await updateDoc(userDocRef, { emailVerified: firebaseUser.emailVerified });
      }
    }
    console.log('[Auth] User authentication successful via signInWithEmailAndPassword.');
    // Return the FirebaseUser; onAuthStateChanged will provide the full User profile to the app state.
    return firebaseUser;
  } catch (error: any) {
    console.error('[Auth] Error during login:', error.message);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    console.log('[Auth] User signed out.');
  } catch (error: any) {
    console.error('[Auth] Error during sign out:', error.message);
    throw error;
  }
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userProfileData = userDocSnap.data();
        // Ensure Firestore profile is updated if verification status changed since last check
        if (userProfileData.emailVerified !== firebaseUser.emailVerified) {
          await updateDoc(userDocRef, { emailVerified: firebaseUser.emailVerified });
        }
        callback({
          ...(userProfileData as Omit<User, 'id' | 'emailVerified'>),
          id: firebaseUser.uid,
          email: firebaseUser.email || userProfileData.email,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        console.warn(`[Auth] User profile not found for UID: ${firebaseUser.uid} during onAuthStateChanged. Creating a basic profile.`);
        const newProfile: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          emailVerified: firebaseUser.emailVerified,
        };
        try {
          await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), newProfile);
          callback(newProfile);
        } catch (dbError) {
            console.error("[Auth] Failed to create fallback user profile in Firestore:", dbError);
            callback({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'User',
                emailVerified: firebaseUser.emailVerified,
            });
        }
      }
    } else {
      callback(null);
    }
  });
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
