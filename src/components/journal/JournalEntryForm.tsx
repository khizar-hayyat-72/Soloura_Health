
// src/components/journal/JournalEntryForm.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { JournalEntry } from '@/lib/types';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

const journalEntrySchema = z.object({
  content: z.string()
    .min(10, { message: "Journal entry must be at least 10 characters." })
    .max(10000, { message: "Journal entry must be 10,000 characters or less." }),
  moodRating: z.number().min(1).max(10),
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
  onSubmit: (data: JournalEntryFormValues) => Promise<void>;
  initialData?: Partial<JournalEntry>;
  isSubmitting?: boolean;
}

export function JournalEntryForm({ onSubmit, initialData, isSubmitting }: JournalEntryFormProps) {
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      content: initialData?.content || '',
      moodRating: initialData?.moodRating || 5,
    },
  });
  
  const [moodValue, setMoodValue] = useState(initialData?.moodRating || 5);

  const handleFormSubmit = async (data: JournalEntryFormValues) => {
    await onSubmit(data);
    // Optionally reset form: form.reset(); but usually handled by navigation or parent state
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">How are you feeling today?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write about your day, your thoughts, your feelings..."
                  className="min-h-[200px] resize-none text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Take your time and express yourself freely. (Max 10,000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moodRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Overall Mood Rating: {moodValue}/10</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]} // Use field.value to make it controlled
                  max={10}
                  min={1}
                  step={1}
                  onValueChange={(value) => {
                    field.onChange(value[0]); // Update RHF state
                    setMoodValue(value[0]);   // Update local state for FormLabel display
                  }}
                  className="my-4"
                  aria-label="Mood rating slider"
                />
              </FormControl>
              <FormDescription>
                1 being very low, 10 being extremely positive.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData?.id ? 'Update Entry' : 'Save Entry'}
        </Button>
      </form>
    </Form>
  );
}

