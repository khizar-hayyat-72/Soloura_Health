
// src/app/(app)/mood-tracker/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import type { JournalEntry, MoodAnalysisResult, MoodTrendEntry, MoodTrendAnalysisResult } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getJournalEntriesForUser, getJournalEntryById, getJournalEntriesForLastNDays } from '@/lib/journal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle, Lightbulb, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { analyzeMood } from '@/ai/flows/analyze-mood';
import { analyzeMoodTrend } from '@/ai/flows/analyze-mood-trend';
import { Skeleton } from '@/components/ui/skeleton';

const MoodChart = dynamic(() => 
  import('@/components/mood/MoodChart').then(mod => mod.MoodChart), 
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> 
  }
);

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]); // For the dropdown
  const [chartEntries, setChartEntries] = useState<JournalEntry[]>([]); // For the chart (last 7 days)
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<MoodAnalysisResult | null>(null);
  const [moodTrendAnalysis, setMoodTrendAnalysis] = useState<MoodTrendAnalysisResult | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingTrend, setIsAnalyzingTrend] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (user) {
      setIsLoadingEntries(true);
      try {
        const [allEntries, last7DaysEntries] = await Promise.all([
          getJournalEntriesForUser(user.id), // For dropdown
          getJournalEntriesForLastNDays(user.id, 7) // For chart
        ]);
        
        setAllJournalEntries(allEntries);
        setChartEntries(last7DaysEntries);

        if (allEntries.length > 0 && !selectedEntryId) {
          setSelectedEntryId(allEntries[0].id); 
        } else if (allEntries.length === 0) {
          setSelectedEntryId(undefined);
        }
      } catch (error) {
        console.error("Failed to fetch entries for mood tracker:", error);
        toast({ title: "Error", description: "Could not load journal entries.", variant: "destructive" });
      } finally {
        setIsLoadingEntries(false);
      }
    } else {
      setAllJournalEntries([]);
      setChartEntries([]);
      setSelectedEntryId(undefined);
      setIsLoadingEntries(false);
    }
  }, [user, toast, selectedEntryId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAnalyzeMood = async () => {
    if (!user || !selectedEntryId) {
      toast({ title: "Error", description: "Please select a journal entry to analyze.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const entryToAnalyze = allJournalEntries.find(entry => entry.id === selectedEntryId);
      let contentToAnalyze = entryToAnalyze?.content;

      if (!contentToAnalyze) {
        const fetchedEntry = await getJournalEntryById(selectedEntryId);
        if (!fetchedEntry || fetchedEntry.userId !== user.id) {
          toast({ title: "Error", description: "Selected journal entry not found or access denied.", variant: "destructive" });
          setIsAnalyzing(false);
          return;
        }
        contentToAnalyze = fetchedEntry.content;
      }
      
      const result = await analyzeMood({ journalEntry: contentToAnalyze });
      setAnalysisResult(result);
      toast({ title: "Analysis Complete", description: "Mood analysis successful.", });

    } catch (error) {
      console.error("Mood analysis failed:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze mood. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeMoodTrend = async () => {
    if (!user || chartEntries.length < 1) { // Use chartEntries for trend analysis base
      toast({ title: "Not Enough Data", description: "Need at least a few recent journal entries to analyze mood trends.", variant: "default" });
      return;
    }
    setIsAnalyzingTrend(true);
    setMoodTrendAnalysis(null);
    try {
      // chartEntries are already sorted by date desc from getJournalEntriesForLastNDays
      // For the AI, we want them sorted oldest to newest.
      const entriesForAI = [...chartEntries]
        .reverse() // reverse to be oldest to newest
        .map(entry => ({
          date: format(parseISO(entry.date), 'MMM d, yyyy'), 
          moodRating: entry.moodRating,
        }));

      if (entriesForAI.length < 2) { // Still need at least 2 for a trend
        toast({ title: "Not Enough Data", description: "Need at least two recent journal entries to analyze a trend.", variant: "default" });
        setIsAnalyzingTrend(false);
        return;
      }

      const result = await analyzeMoodTrend({ recentMoods: entriesForAI });
      setMoodTrendAnalysis(result);
      toast({ title: "Trend Analysis Complete", description: "Your mood trend has been analyzed." });
    } catch (error) {
      console.error("Mood trend analysis failed:", error);
      toast({ title: "Trend Analysis Failed", description: "Could not analyze mood trend. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzingTrend(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>AI Mood Tracker</PageTitle>
      <p className="text-lg text-muted-foreground mb-8">
        Gain insights into your emotional patterns and get personalized suggestions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoodChart data={chartEntries} timeRange="week" /> {/* Pass chartEntries (last 7 days) */}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" /> Analyze Single Entry</CardTitle>
                <CardDescription>Select a journal entry for detailed AI mood analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoadingEntries ? (
                <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading entries...</p>
                </div>
                ) : allJournalEntries.length === 0 ? (
                <Alert variant="default" className="bg-accent/10 border-accent text-accent-foreground">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    <AlertTitle className="font-semibold">No Journal Entries</AlertTitle>
                    <AlertDescription>Write journal entries to analyze your mood.</AlertDescription>
                </Alert>
                ) : (
                <Select onValueChange={setSelectedEntryId} value={selectedEntryId}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a journal entry" />
                    </SelectTrigger>
                    <SelectContent>
                    {allJournalEntries.map(entry => (
                        <SelectItem key={entry.id} value={entry.id}>
                        {format(parseISO(entry.date), 'MMM d, yyyy')} - {entry.content.substring(0, 30)}...
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                )}

                <Button onClick={handleAnalyzeMood} disabled={isAnalyzing || !selectedEntryId || allJournalEntries.length === 0 || isLoadingEntries} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Selected Entry
                </Button>

                {analysisResult && (
                <Card className="mt-6 bg-background border-primary/50">
                    <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5" /> Single Entry Insights
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                    <p><strong>AI Mood Rating:</strong> <span className="font-bold text-primary">{analysisResult.moodRating}/10</span></p>
                    <p><strong>Keywords:</strong> <span className="italic text-muted-foreground">{analysisResult.moodKeywords}</span></p>
                    <div>
                        <strong className="block mb-1">Suggested Solutions:</strong>
                        <p className="text-muted-foreground whitespace-pre-wrap p-3 bg-primary/5 rounded-md border-primary/20">{analysisResult.suggestedSolutions}</p>
                    </div>
                    </CardContent>
                </Card>
                )}
            </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><TrendingUpIcon className="mr-2 h-5 w-5 text-accent" /> Mood Trend Analysis</CardTitle>
                <CardDescription>Get an AI analysis of your mood trend over the last few days.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAnalyzeMoodTrend} 
                  disabled={isAnalyzingTrend || chartEntries.length < 2 || isLoadingEntries} 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isAnalyzingTrend ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUpIcon className="mr-2 h-4 w-4" />}
                  Analyze Mood Trend (Last 7 Days)
                </Button>
                {isAnalyzingTrend && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <p className="ml-2 text-muted-foreground">Analyzing trend...</p>
                  </div>
                )}
                {moodTrendAnalysis && !isAnalyzingTrend && (
                  <div className="text-sm text-foreground whitespace-pre-wrap p-3 mt-4 bg-accent/10 rounded-md border border-accent/20">
                    {moodTrendAnalysis.trendAnalysis}
                  </div>
                )}
                {!isAnalyzingTrend && !moodTrendAnalysis && chartEntries.length < 2 && !isLoadingEntries && (
                   <Alert variant="default" className="bg-accent/10 border-accent text-accent-foreground">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    <AlertTitle className="font-semibold">Not Enough Data</AlertTitle>
                    <AlertDescription>You need at least two recent journal entries to analyze a trend.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </PageContainer>
  );
}

