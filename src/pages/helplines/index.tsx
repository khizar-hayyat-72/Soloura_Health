// src/app/(app)/helplines/page.tsx
import { PageContainer } from '@/components/shared/PageContainer';
import { PageTitle } from '@/components/shared/PageTitle';
import { HelplineCard } from '@/components/helplines/HelplineCard';
import type { Helpline } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { AuthGuard } from '@/components/auth/AuthGuard';

const helplinesData: Helpline[] = [
  {
    id: '1',
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: 'Provides 24/7, free and confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
    logo: 'https://placehold.co/100x100.png?text=988',
  },
  {
    id: '2',
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Connect with a crisis counselor for free, 24/7 support. Text HOME to 741741 from anywhere in the US.',
    logo: 'https://placehold.co/100x100.png?text=CTL',
  },
  {
    id: '3',
    name: 'The Trevor Project',
    number: '1-866-488-7386',
    description: 'Provides crisis intervention and suicide prevention services to lesbian, gay, bisexual, transgender, queer & questioning (LGBTQ) young people under 25.',
    logo: 'https://placehold.co/100x100.png?text=Trevor',
  },
  {
    id: '4',
    name: 'SAMHSA National Helpline',
    number: '1-800-662-HELP (4357)',
    description: 'Confidential free help, from public health agencies, to find substance use treatment and information. 24/7.',
    logo: 'https://placehold.co/100x100.png?text=SAMHSA',
  },
  {
    id: '5',
    name: 'NAMI Helpline',
    number: '1-800-950-NAMI (6264)',
    description: 'The National Alliance on Mental Illness helpline provides information, referrals, and support to people living with mental illness, family members, and caregivers.',
    logo: 'https://placehold.co/100x100.png?text=NAMI',
  },
  {
    id: '6',
    name: 'Veterans Crisis Line',
    number: 'Dial 988 then Press 1',
    description: 'Confidential support for Veterans in crisis and their families and friends. Available 24/7.',
    logo: 'https://placehold.co/100x100.png?text=VCL',
  }
];

export default function HelplinesPage() {
  return (
    <AuthGuard>
      <PageContainer>
        <PageTitle>Mental Health Helplines</PageTitle>
        <Alert className="mb-8 bg-accent/20 border-accent text-accent-foreground">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle className="font-semibold text-accent">Important Notice</AlertTitle>
          <AlertDescription>
            If you are in immediate danger or experiencing a medical emergency, please call 911 or your local emergency number.
            The resources listed below are for support and information.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helplinesData.map((helpline) => (
            <HelplineCard key={helpline.id} helpline={helpline} />
          ))}
        </div>
      </PageContainer>
    </AuthGuard>
  );
}
