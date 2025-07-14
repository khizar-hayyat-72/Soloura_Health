
// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthCard } from '@/components/auth/AuthCard';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center px-4">
      <AuthCard
        title="Welcome Back!"
        description="Log in to continue your journey with Soloura."
        footerContent={
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
