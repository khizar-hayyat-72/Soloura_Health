// src/components/helplines/HelplineCard.tsx
import type { Helpline } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react';

interface HelplineCardProps {
  helpline: Helpline;
}

export function HelplineCard({ helpline }: HelplineCardProps) {
  // Simplified phone number for the tel link
  const simplePhoneNumber = helpline.number.replace(/[^0-9+\-()]/g, '');

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-md">
          <PhoneCall className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="font-headline text-xl">{helpline.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {helpline.description && (
          <CardDescription className="text-base leading-relaxed mb-4">{helpline.description}</CardDescription>
        )}
        <p className="font-semibold text-primary text-lg">{helpline.number}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <a href={`tel:${simplePhoneNumber}`}>
            <PhoneCall className="mr-2 h-4 w-4" /> Call Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
