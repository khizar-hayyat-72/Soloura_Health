// src/lib/journal.ts
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  limit,
  getCountFromServer,
  startAt,
  endAt,
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalEntry } from './types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const JOURNAL_COLLECTION = 'journalEntries';

// Fetches all entries, sorted by date descending (newest first)
export async function getJournalEntriesForUser(userId: string): Promise<JournalEntry[]> {
  if (!userId) {
    console.warn('[Journal] getJournalEntriesForUser: No userId provided.');
    return [];
  }
  console.log(`[Journal] getJournalEntriesForUser called for userId: ${userId}`);
  try {
    const q = query(
      collection(db, JOURNAL_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    console.log(`[Journal] Found ${entries.length} entries for userId ${userId}.`);
    return entries;
  } catch (error) {
    console.error(`[Journal] Error fetching journal entries for userId ${userId}:`, error);
    throw error;
  }
}

// Fetches the most recent journal entry for a user
export async function getLatestJournalEntryForUser(userId: string): Promise<JournalEntry | null> {
  if (!userId) {
    console.warn('[Journal] getLatestJournalEntryForUser: No userId provided.');
    return null;
  }
  try {
    const q = query(
      collection(db, JOURNAL_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return { id: querySnapshot.docs[0].id, ...docData } as JournalEntry;
    }
    return null;
  } catch (error) {
    console.error(`[Journal] Error fetching latest journal entry for userId ${userId}:`, error);
    throw error;
  }
}

// Gets the total count of journal entries for a user
export async function getJournalEntriesCountForUser(userId: string): Promise<number> {
  if (!userId) {
    console.warn('[Journal] getJournalEntriesCountForUser: No userId provided.');
    return 0;
  }
  try {
    const q = query(
      collection(db, JOURNAL_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error(`[Journal] Error fetching journal entry count for userId ${userId}:`, error);
    throw error;
  }
}

// Fetches journal entries for the last N days for a user
export async function getJournalEntriesForLastNDays(userId: string, days: number): Promise<JournalEntry[]> {
  if (!userId) {
    console.warn('[Journal] getJournalEntriesForLastNDays: No userId provided.');
    return [];
  }
  try {
    const today = new Date();
    const endDate = endOfDay(today);
    const startDate = startOfDay(subDays(today, days - 1));

    const q = query(
      collection(db, JOURNAL_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', startDate.toISOString()),
      where('date', '<=', endDate.toISOString()),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    return entries;
  } catch (error) {
    console.error(`[Journal] Error fetching journal entries for last ${days} days for userId ${userId}:`, error);
    throw error;
  }
}


export async function addJournalEntry(
  userId: string,
  entryData: { content: string; moodRating: number; date: string }
): Promise<JournalEntry> {
  if (!userId) {
    throw new Error('[Journal] addJournalEntry: No userId provided.');
  }
  console.log(`[Journal] addJournalEntry called for userId: ${userId}`);
  try {
    const docRef = await addDoc(collection(db, JOURNAL_COLLECTION), {
      userId,
      content: entryData.content,
      moodRating: entryData.moodRating,
      date: entryData.date, // Expecting ISO string
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`[Journal] Added entry with ID: ${docRef.id} for userId ${userId}.`);
    const newEntryDoc = await getDoc(docRef); // Fetch the newly added document to get server timestamps
    return {
        id: newEntryDoc.id,
        ...(newEntryDoc.data() as Omit<JournalEntry, 'id'>),
    };
  } catch (error) {
    console.error(`[Journal] Error adding journal entry for userId ${userId}:`, error);
    throw error;
  }
}

export async function getJournalEntryById(entryId: string): Promise<JournalEntry | null> {
  console.log(`[Journal] getJournalEntryById called for entryId: ${entryId}`);
  if (!entryId) {
    console.warn('[Journal] getJournalEntryById: No entryId provided.');
    return null;
  }
  try {
    const docRef = doc(db, JOURNAL_COLLECTION, entryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const entry = { id: docSnap.id, ...docSnap.data() } as JournalEntry;
      console.log(`[Journal] Found entry by ID:`, entry);
      return entry;
    } else {
      console.log(`[Journal] No entry found for ID ${entryId}.`);
      return null;
    }
  } catch (error) {
    console.error(`[Journal] Error fetching journal entry by ID ${entryId}:`, error);
    throw error;
  }
}

export async function updateJournalEntry(
  entryId: string,
  entryData: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<JournalEntry | null> {
  console.log(`[Journal] updateJournalEntry called for entryId: ${entryId}`);
  if (!entryId) {
    throw new Error('[Journal] updateJournalEntry: No entryId provided.');
  }
  try {
    const docRef = doc(db, JOURNAL_COLLECTION, entryId);
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      console.warn(`[Journal] Update failed: No entry found for ID ${entryId}.`);
      return null;
    }

    const updatePayload: Record<string, any> = { ...entryData };
    if (entryData.date) { 
        updatePayload.date = entryData.date;
    }
    updatePayload.updatedAt = serverTimestamp();


    await updateDoc(docRef, updatePayload);
    console.log(`[Journal] Updated entry with ID: ${entryId}.`);
    const updatedDocSnap = await getDoc(docRef); 
     if (updatedDocSnap.exists()) {
      return { id: updatedDocSnap.id, ...updatedDocSnap.data() } as JournalEntry;
    }
    return null;

  } catch (error) {
    console.error(`[Journal] Error updating journal entry ${entryId}:`, error);
    throw error;
  }
}

export async function deleteJournalEntry(entryId: string): Promise<boolean> {
  console.log(`[Journal] deleteJournalEntry called for entryId: ${entryId}`);
  if (!entryId) {
    throw new Error('[Journal] deleteJournalEntry: No entryId provided.');
  }
  try {
    const docRef = doc(db, JOURNAL_COLLECTION, entryId);
    await deleteDoc(docRef);
    console.log(`[Journal] Deleted entry with ID: ${entryId}.`);
    return true;
  } catch (error) {
    console.error(`[Journal] Error deleting journal entry ${entryId}:`, error);
    throw error; 
  }
}
