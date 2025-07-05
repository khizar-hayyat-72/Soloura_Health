// src/components/dashboard/MoodCalendarGrid.tsx
"use client";

import type { JournalEntry } from '@/lib/types';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MoodDay {
  date: Date;
  mood: number | null;
  dayOfMonth: string;
  entryCount: number;
  contentSnippet?: string;
}

interface MoodCalendarGridProps {
  entries: JournalEntry[];
}

const getMoodColor = (mood: number | null): string => {
  if (mood === null) return 'bg-muted hover:bg-muted/80';
  if (mood >= 8) return 'bg-primary hover:bg-primary/90';
  if (mood >= 5) return 'bg-accent hover:bg-accent/90';
  return 'bg-[hsl(0,80%,92%)] hover:bg-[hsl(0,80%,90%)]';
};

const getMoodTextColor = (mood: number | null): string => {
  if (mood === null) return 'text-muted-foreground/80';
  if (mood >= 8) return 'text-primary-foreground';
  if (mood >= 5) return 'text-accent-foreground';
  return 'text-[hsl(0,60%,50%)]';
}

export function MoodCalendarGrid({ entries }: MoodCalendarGridProps) {
  const days: MoodDay[] = [];
  const today = new Date();

  const entriesByDate: Record<string, { totalMood: number; count: number; contentSnippets: string[]; originalDate: Date }> = {};
  
  // Sort entries to ensure the first snippet is from the earliest entry of the day
  const sortedEntries = [...entries].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // Group entries by normalized date and calculate average mood
  sortedEntries.forEach(entry => {
    const dayKey = format(startOfDay(parseISO(entry.date)), 'yyyy-MM-dd');

    if (!entriesByDate[dayKey]) {
      entriesByDate[dayKey] = { totalMood: 0, count: 0, contentSnippets: [], originalDate: parseISO(entry.date) };
    }
    entriesByDate[dayKey].totalMood += entry.moodRating;
    entriesByDate[dayKey].count += 1;
    if (entriesByDate[dayKey].contentSnippets.length < 1) { // Take snippet from the first entry of the day
      entriesByDate[dayKey].contentSnippets.push(entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : ''));
    }
  });

  // Create the grid for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = startOfDay(subDays(today, i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = entriesByDate[dateStr];
    
    let moodForDay: number | null = null;
    let entryCount = 0;
    let contentSnippet: string | undefined = undefined;

    if (dayData) {
      entryCount = dayData.count;
      moodForDay = parseFloat((dayData.totalMood / dayData.count).toFixed(1));
      contentSnippet = dayData.contentSnippets[0];
    }
    
    days.push({
      date,
      mood: moodForDay,
      dayOfMonth: format(date, 'd'),
      entryCount,
      contentSnippet,
    });
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline">Recent Moods</CardTitle>
        <CardDescription>A visual overview of your mood. Hover over a square for details.</CardDescription>
      </CardHeader>
      <CardContent>
        {days.length > 0 ? (
          <div className="max-w-[16rem] mx-auto">
            <TooltipProvider delayDuration={100}>
              <div className="grid grid-cols-6 gap-px">
                {days.map((day, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'aspect-square rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] font-medium transition-colors cursor-default',
                          getMoodColor(day.mood),
                          getMoodTextColor(day.mood)
                        )}
                      >
                        {day.dayOfMonth}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{format(day.date, 'MMMM d, yyyy')}</p>
                      {day.mood !== null ? (
                        <>
                          <p>
                            {day.entryCount > 1 ? 'Avg. Mood: ' : 'Mood: '} 
                            {day.mood}/10
                            {day.entryCount > 1 && ` (${day.entryCount} entries)`}
                          </p>
                          {day.contentSnippet && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <em>{`"${day.contentSnippet}"`}</em>
                            </p>
                          )}
                        </>
                      ) : (
                        <p>No entry</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No mood data available for the last 30 days.</p>
        )}
      </CardContent>
    </Card>
  );
}
