
// src/components/auth/SignupForm.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // For redirection after successful signup message

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.name, data.password);
      toast({
        title: "Signup Successful!",
        description: "A verification email has been sent. Please check your inbox to verify your account.",
        duration: 5000, // Keep toast longer
      });
      // Redirect to login page or a "please verify" page after showing the toast
      // For now, let's redirect to login after a short delay or user action.
      // Or, more simply, useAuth's onAuthStateChanged might handle redirection to dashboard if already "logged in" by Firebase.
      // However, since verification is now a step, redirecting to login might be better.
      router.push('/login'); 
    } catch (error: any) {
       toast({
        title: "Signup Failed",
        description: error.message || "Could not create an account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
