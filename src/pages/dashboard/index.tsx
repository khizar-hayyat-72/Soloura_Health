// src/app/(app)/dashboard/page.tsx
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic'; // Import dynamic
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Smile, TrendingUp, Edit3, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { JournalEntry } from '@/lib/types';
import {
  getLatestJournalEntryForUser,
  getJournalEntriesCountForUser,
  getJournalEntriesForLastNDays,
} from '@/lib/journal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { AuthGuard } from '../../components/auth/AuthGuard';

// Dynamically import MoodCalendarGrid
const MoodCalendarGrid = dynamic(() =>
  import('@/components/dashboard/MoodCalendarGrid').then(mod => mod.MoodCalendarGrid),
  {
    ssr: false, // Disable SSR for this component if it's client-side only and heavy
    loading: () => <Skeleton className="h-[200px] w-full rounded-lg" /> // Basic skeleton
  }
);


export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [latestMood, setLatestMood] = useState<number | null>(null);
  const [journalCount, setJournalCount] = useState(0);
  const [calendarEntries, setCalendarEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const [latestEntryData, countData, entriesForCalendarData] = await Promise.all([
          getLatestJournalEntryForUser(user.id),
          getJournalEntriesCountForUser(user.id),
          getJournalEntriesForLastNDays(user.id, 35)
        ]);

        setLatestMood(latestEntryData?.moodRating ?? null);
        setJournalCount(countData);
        setCalendarEntries(entriesForCalendarData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else {
      setLatestMood(null);
      setJournalCount(0);
      setCalendarEntries([]);
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading && user) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </PageContainer>
    );
  }

  return (
    <AuthGuard>
      <PageContainer>
        <div className="flex justify-between mb-4">
          <PageTitle>{getGreeting()}, {user?.name || 'User'}!</PageTitle>
          <Button
            variant="outline"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
        <p className="text-lg text-muted-foreground mb-8">
          Ready to reflect and grow today? Your mental wellbeing journey continues here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">New Journal Entry</CardTitle>
              <Edit3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Capture your thoughts and feelings.</CardDescription>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/journal/new">Write in Journal</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-accent">Latest Mood</CardTitle>
              <Smile className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              {latestMood !== null ? (
                <div className="text-2xl font-bold text-accent">{latestMood}/10</div>
              ) : (
                <p className="text-muted-foreground">No mood recorded yet.</p>
              )}
              <CardDescription className="mt-1">Your most recent mood rating.</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Journal Entries</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{journalCount}</div>
              <CardDescription className="mt-1">Total entries written.</CardDescription>
            </CardContent>
          </Card>

          {user && !isLoading && (
            <div className="md:col-span-2 lg:col-span-3">
              <MoodCalendarGrid entries={calendarEntries} />
            </div>
          )}
        </div>

        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12a10 10 0 0 0-7.07 2.93A9.96 9.96 0 0 0 12 22a10 10 0 0 0 10-10h-10z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-headline font-semibold text-primary mb-2">Explore Your Wellbeing Tools</h3>
              <p className="text-muted-foreground mb-4">
                Dive into your mood trends or chat with our wellness AI for personalized tips and meditation guidance.
              </p>
              <div className="flex gap-4">
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Link href="/mood-tracker"><TrendingUp className="mr-2 h-4 w-4" />View Mood Trends</Link>
                </Button>
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Link href="/chatbot"><Smile className="mr-2 h-4 w-4" />Chat for Tips</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    </AuthGuard>
  );
}
