
// src/app/(app)/chatbot/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, MessageCircle, Sparkles, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedWellbeingTips, type PersonalizedWellbeingTipsOutput } from '@/ai/flows/personalized-wellbeing-tips';

const chatbotInputSchema = z.object({
  currentMood: z.number().min(1).max(10),
  currentThoughts: z.string().min(5, { message: "Please share a few thoughts (at least 5 characters)." }).max(500, { message: "Thoughts should be under 500 characters." }),
});

type ChatbotInputValues = z.infer<typeof chatbotInputSchema>;

export default function ChatbotPage() {
  const { toast } = useToast();
  const [wellbeingTips, setWellbeingTips] = useState<PersonalizedWellbeingTipsOutput | null>(null);
  const [isFetchingTips, setIsFetchingTips] = useState(false);
  const [moodValue, setMoodValue] = useState(5);

  const form = useForm<ChatbotInputValues>({
    resolver: zodResolver(chatbotInputSchema),
    defaultValues: {
      currentMood: 5,
      currentThoughts: '',
    },
  });

  const onSubmit = async (data: ChatbotInputValues) => {
    setIsFetchingTips(true);
    setWellbeingTips(null);
    try {
      const tips = await getPersonalizedWellbeingTips({
        mood: data.currentMood,
        journalEntry: data.currentThoughts, 
      });
      setWellbeingTips(tips);
      toast({ title: "Tips Received!", description: "Here are some personalized tips for you." });
    } catch (error) {
      console.error("Failed to get wellbeing tips:", error);
      toast({ title: "Error", description: "Could not fetch wellbeing tips. Please try again.", variant: "destructive" });
    } finally {
      setIsFetchingTips(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>Personalized Wellness Chat</PageTitle>
      <p className="text-lg text-muted-foreground mb-8">
        Share your current mood and thoughts to receive tailored meditation and wellbeing tips from our AI.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><MessageCircle className="mr-2 h-5 w-5 text-primary" />How are you feeling?</CardTitle>
            <CardDescription>Let us know your current state to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentMood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Current Mood: {moodValue}/10</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          max={10}
                          min={1}
                          step={1}
                          onValueChange={(value) => {
                            field.onChange(value[0]);
                            setMoodValue(value[0]);
                          }}
                          className="my-2"
                          aria-label="Current mood slider"
                        />
                      </FormControl>
                      <FormDescription>1 (Low) - 10 (Great)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentThoughts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Briefly, what&apos;s on your mind?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Feeling a bit stressed about work today."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                       <FormDescription>A few words or sentences will do.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isFetchingTips}>
                  {isFetchingTips ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Get Personalized Tips
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className={`shadow-lg transition-opacity duration-500 ${wellbeingTips ? 'opacity-100' : 'opacity-50'}`}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-accent" />Your AI-Powered Tips</CardTitle>
            <CardDescription>Here are some suggestions based on what you shared.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            {isFetchingTips && (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-2" />
                <p className="text-muted-foreground">Generating your tips...</p>
              </div>
            )}
            {!isFetchingTips && wellbeingTips && (
              <div className="text-sm text-foreground whitespace-pre-wrap p-4 bg-accent/10 rounded-md border border-accent/20">
                {wellbeingTips.wellbeingTips}
              </div>
            )}
            {!isFetchingTips && !wellbeingTips && (
              <p className="text-muted-foreground">Your personalized tips will appear here once generated.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
