
// src/components/mood/MoodChart.tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { JournalEntry } from '@/lib/types';
import { format, parseISO, startOfDay } from 'date-fns';

interface MoodChartProps {
  data: JournalEntry[]; 
  timeRange?: 'week' | 'month' | 'all'; 
}

interface ProcessedChartData {
  date: string; // Formatted for X-axis, e.g., 'MMM d'
  mood: number;
  fullDate: string; // Formatted for tooltip, e.g., 'MMMM d, yyyy'
  entryCount: number;
  contentSnippet: string; // Snippet from the first entry of the day for tooltip
}

const chartConfig = {
  mood: {
    label: "Mood Rating",
    color: "hsl(var(--primary))",
  },
};

export function MoodChart({ data }: MoodChartProps) {
  const processDataForChart = (): ProcessedChartData[] => {
    if (!data || data.length === 0) return [];

    const dailyMoods: Record<string, { totalMood: number; count: number; contentSnippets: string[]; originalDate: Date }> = {};

    // Group entries by date and sum moods/count entries
    data.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const dayKey = format(startOfDay(entryDate), 'yyyy-MM-dd');

      if (!dailyMoods[dayKey]) {
        dailyMoods[dayKey] = { totalMood: 0, count: 0, contentSnippets: [], originalDate: entryDate };
      }
      dailyMoods[dayKey].totalMood += entry.moodRating;
      dailyMoods[dayKey].count += 1;
      if (dailyMoods[dayKey].contentSnippets.length === 0) { // Take snippet from the first entry of the day
        dailyMoods[dayKey].contentSnippets.push(entry.content.substring(0, 50) + (entry.content.length > 50 ? '...' : ''));
      }
    });

    // Calculate average and format for chart
    const processedData = Object.keys(dailyMoods).map(dayKey => {
      const dayData = dailyMoods[dayKey];
      const averageMood = parseFloat((dayData.totalMood / dayData.count).toFixed(1));
      return {
        date: format(dayData.originalDate, 'MMM d'), // X-axis label
        mood: averageMood,
        fullDate: format(dayData.originalDate, 'MMMM d, yyyy'), // Tooltip display
        entryCount: dayData.count,
        contentSnippet: dayData.contentSnippets[0] || '', // Use the first snippet
      };
    });

    // Sort by date ascending for the chart
    return processedData.sort((a, b) => parseISO(a.fullDate).getTime() - parseISO(b.fullDate).getTime());
  };

  const chartData = processDataForChart();

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Mood Trends (Last 7 Days)</CardTitle>
          <CardDescription>Your mood ratings over time will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No mood data available for the last 7 days.</p>
        </CardContent>
      </Card>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ProcessedChartData;
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-primary">{`Date: ${data.fullDate}`}</p>
          <p className="text-sm text-foreground">
            {data.entryCount > 1 ? `Avg. Mood: ` : `Mood: `} 
            {data.mood}/10 
            {data.entryCount > 1 && ` (${data.entryCount} entries)`}
          </p>
          {data.entryCount === 1 && data.contentSnippet && (
            <p className="text-xs text-muted-foreground mt-1"><em>{`"${data.contentSnippet}"`}</em></p>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Mood Trends (Last 7 Days)</CardTitle>
        <CardDescription>
          Visualizing your mood ratings over the last 7 days. Hover over bars for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              domain={[0, 10]} 
              ticks={[0, 2, 4, 6, 8, 10]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.2)' }} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} formatter={(value) => <span className="text-muted-foreground">{value}</span>}/>
            <Bar dataKey="mood" fill={chartConfig.mood.color} radius={[4, 4, 0, 0]} barSize={Math.min(30, 300 / Math.max(chartData.length,1))} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

