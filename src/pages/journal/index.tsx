
// src/app/(app)/journal/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import { JournalEntryCard } from '@/components/journal/JournalEntryCard';
import type { JournalEntry } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getJournalEntriesForUser, deleteJournalEntry as deleteEntryService } from '@/lib/journal';
import { PlusCircle, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function JournalListPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const userEntries = await getJournalEntriesForUser(user.id);
        // Entries are already sorted by date desc by getJournalEntriesForUser
        setEntries(userEntries);
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
        toast({ title: "Error", description: "Could not load journal entries.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else {
      setEntries([]); // Clear entries if no user
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDeleteRequest = (id: string) => {
    setEntryToDelete(id);
  };

  const confirmDelete = async () => {
    if (!user || !entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEntryService(entryToDelete);
      toast({ title: "Success", description: "Journal entry deleted." });
      // Refetch entries to update the list
      await fetchEntries();
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    } finally {
      setEntryToDelete(null);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your journal...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-8">
        <PageTitle>My Journal</PageTitle>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/journal/new">
            <PlusCircle className="mr-2 h-5 w-5" /> New Entry
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No journal entries yet.</h3>
          <p className="text-muted-foreground mb-6">Start writing to track your thoughts and mood.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/journal/new">Create Your First Entry</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={handleDeleteRequest} />
          ))}
        </div>
      )}
      
      {entryToDelete && (
        <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your journal entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEntryToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </PageContainer>
  );
}
