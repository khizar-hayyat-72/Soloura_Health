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
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]);
  const [chartEntries, setChartEntries] = useState<JournalEntry[]>([]);
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
          getJournalEntriesForUser(user.id),
          getJournalEntriesForLastNDays(user.id, 7)
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

      // 🔁 CALL API INSTEAD OF DIRECTLY IMPORTING Genkit
      const response = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry: contentToAnalyze }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Unknown error');

      setAnalysisResult(result);
      toast({ title: "Analysis Complete", description: "Mood analysis successful." });

    } catch (error) {
      console.error("Mood analysis failed:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze mood. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ☝️ You can do the same thing with `analyzeMoodTrend` if needed.

  return (
    <PageContainer>
      <PageTitle>AI Mood Tracker</PageTitle>
      {/* UI remains the same */}
      {/* Replace analyzeMood() and analyzeMoodTrend() with API calls in both places */}
    </PageContainer>
  );
}
