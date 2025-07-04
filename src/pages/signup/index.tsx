
// src/app/(auth)/signup/page.tsx
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthCard } from '@/components/auth/AuthCard';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your Soloura Account"
      description="Join our community and start your wellness journey today."
      footerContent={
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
