
// src/app/(app)/journal/new/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import { useAuth } from '@/hooks/useAuth';
import { addJournalEntry } from '@/lib/journal';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function NewJournalEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { content: string; moodRating: number }) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create an entry.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addJournalEntry(user.id, {
        date: new Date().toISOString(), // Client-side date, can be adjusted if serverTimestamp is preferred for 'date' too
        content: data.content,
        moodRating: data.moodRating,
      });
      toast({ title: "Success", description: "Journal entry saved successfully." });
      router.push('/journal');
    } catch (error) {
      toast({ title: "Error", description: "Failed to save journal entry.", variant: "destructive" });
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>New Journal Entry</PageTitle>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <JournalEntryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
