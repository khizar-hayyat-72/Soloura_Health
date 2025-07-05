// src/app/(app)/journal/[id]/journal-entry-client.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams as useClientParams } from 'next/navigation';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import type { JournalEntry } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getJournalEntryById, updateJournalEntry, deleteJournalEntry as deleteService } from '@/lib/journal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Smile, Meh, Frown, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
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

export default function JournalEntryClientPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const clientRouterParams = useClientParams();

  // ✅ Fix: safe access to clientRouterParams
  const entryId = params?.id || 
    (clientRouterParams && typeof clientRouterParams.id === 'string'
      ? clientRouterParams.id
      : undefined);

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchEntry = useCallback(async () => {
    if (authIsLoading || !user || !entryId) {
      if (!authIsLoading && !user && entryId) {
        toast({ title: "Authentication Required", description: "Please log in to view journal entries.", variant: "destructive" });
        router.replace('/login');
      }
      if (!authIsLoading && (!user || !entryId)) {
        setIsLoadingEntry(false);
      }
      return;
    }

    setIsLoadingEntry(true);
    try {
      const fetchedEntry = await getJournalEntryById(entryId);
      if (fetchedEntry) {
        if (fetchedEntry.userId === user.id) {
          setEntry(fetchedEntry);
        } else {
          toast({ title: "Access Denied", description: "You do not have permission to view this entry.", variant: "destructive" });
          router.replace('/journal');
        }
      } else {
        toast({ title: "Error", description: "Journal entry not found.", variant: "destructive" });
        router.replace('/journal');
      }
    } catch (error) {
      console.error("Failed to fetch entry:", error);
      toast({ title: "Error", description: "Could not load the journal entry.", variant: "destructive" });
      router.replace('/journal');
    } finally {
      setIsLoadingEntry(false);
    }
  }, [entryId, router, toast, user, authIsLoading]);

  useEffect(() => {
    if (!authIsLoading) {
      fetchEntry();
    }
  }, [fetchEntry, authIsLoading]);

  const moodIcon = (rating: number) => {
    if (rating >= 8) return <Smile className="h-5 w-5 text-green-500" />;
    if (rating >= 5) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const moodColor = (rating: number) => {
    if (rating >= 8) return "bg-green-100 text-green-700 border-green-300";
    if (rating >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const handleUpdate = async (data: { content: string; moodRating: number }) => {
    if (!entry?.id) return;
    setIsSubmitting(true);
    try {
      const updated = await updateJournalEntry(entry.id, { ...data, date: new Date().toISOString() });
      if (updated) {
        setEntry(updated);
        toast({ title: "Success", description: "Journal entry updated." });
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: "Failed to update entry.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while updating.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    setIsSubmitting(true);
    try {
      await deleteService(entry.id);
      toast({ title: "Success", description: "Journal entry deleted." });
      router.push('/journal');
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (authIsLoading || isLoadingEntry) {
    return (
      <PageContainer className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <PageTitle>Access Denied</PageTitle>
        <p>You must be logged in to view this page.</p>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <PageTitle>Entry Not Found</PageTitle>
        <p>This journal entry could not be loaded or you do not have permission to view it.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary hover:bg-primary/10">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal
      </Button>

      {!isEditing ? (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-2xl mb-1">
                  {format(parseISO(entry.date), 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>{format(parseISO(entry.date), 'h:mm a')}</CardDescription>
              </div>
              <Badge variant="outline" className={`flex items-center gap-2 text-lg px-4 py-2 rounded-lg ${moodColor(entry.moodRating)}`}>
                {moodIcon(entry.moodRating)}
                Mood: {entry.moodRating}/10
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base py-4 border-t border-b">
              {entry.content}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-primary text-primary hover:bg-primary/10">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <PageTitle>Edit Journal Entry</PageTitle>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <JournalEntryForm onSubmit={handleUpdate} initialData={entry} isSubmitting={isSubmitting} />
              <Button variant="outline" onClick={() => setIsEditing(false)} className="mt-4" disabled={isSubmitting}>
                Cancel Edit
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}