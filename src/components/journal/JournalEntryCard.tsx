// src/components/journal/JournalEntryCard.tsx
"use client";

import type { JournalEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Smile, Meh, Frown, Trash2, Edit } from 'lucide-react';
import Link from 'next/link'; // Import Link for editing

interface JournalEntryCardProps {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
}

export function JournalEntryCard({ entry, onDelete }: JournalEntryCardProps) {
  const moodIcon = () => {
    if (entry.moodRating >= 8) return <Smile className="h-5 w-5 text-green-500" />;
    if (entry.moodRating >= 5) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const moodColor = () => {
    if (entry.moodRating >= 8) return "bg-green-100 text-green-700 border-green-300";
    if (entry.moodRating >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl mb-1">
              {format(parseISO(entry.date), 'MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>{format(parseISO(entry.date), 'h:mm a')}</CardDescription>
          </div>
          <Badge variant="outline" className={`flex items-center gap-2 text-sm px-3 py-1 ${moodColor()}`}>
            {moodIcon()}
            Mood: {entry.moodRating}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {entry.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        {/* Edit functionality can be added here. For now, a placeholder or link to a view page. */}
        {/* <Button variant="outline" size="sm" asChild>
          <Link href={`/journal/${entry.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
        </Button> */}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
         <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10">
          <Link href={`/journal/${entry.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
