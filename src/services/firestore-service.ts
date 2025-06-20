
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

/**
 * Creates a user profile document in Firestore.
 * This is typically called right after a user registers.
 * @param uid The user's UID from Firebase Auth.
 * @param data The user profile data to save.
 */
export async function createUserProfile(uid: string, data: Omit<UserProfile, 'id' | 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's UID.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      email: data.email,
      alias: data.alias,
    } as UserProfile;
  } else {
    console.warn(`No user profile document found for uid: ${uid}`);
    return null;
  }
}

/**
 * Updates a user's profile in Firestore.
 * @param uid The user's UID.
 * @param data The partial data to update.
 */
export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, data);
}
