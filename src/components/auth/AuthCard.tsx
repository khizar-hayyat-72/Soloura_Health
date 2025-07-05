
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import type { ReactNode } from "react";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footerContent?: ReactNode;
  showLogo?: boolean;
}

export function AuthCard({ title, description, children, footerContent, showLogo = true }: AuthCardProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        {showLogo && (
           <Link href="/" className="flex items-center justify-center gap-2 text-primary mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12a10 10 0 0 0-7.07 2.93A9.96 9.96 0 0 0 12 22a10 10 0 0 0 10-10h-10z"></path></svg>
            <span className="font-headline text-3xl font-bold">Soloura</span>
          </Link>
        )}
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footerContent && (
        <CardFooter className="flex justify-center">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
}
