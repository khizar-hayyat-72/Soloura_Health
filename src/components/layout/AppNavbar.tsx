
// src/components/layout/AppNavbar.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, TrendingUp, Phone, LogOut, Home, Smile, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: TrendingUp },
  { href: '/chatbot', label: 'Wellness Chat', icon: Smile },
  { href: '/helplines', label: 'Helplines', icon: Phone },
];

export function AppNavbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname(); // Use usePathname hook
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  const isActive = (href: string) => {
    return pathname === href;
  };

  const handleLogout = async () => {
    await logout();
    setIsSheetOpen(false); // Close sheet on logout
  };


  return (
    <header className="bg-card shadow-md sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors" onClick={() => setIsSheetOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12a10 10 0 0 0-7.07 2.93A9.96 9.96 0 0 0 12 22a10 10 0 0 0 10-10h-10z"></path></svg>
            <span className="font-headline text-xl font-bold">Soloura</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "text-foreground hover:bg-primary/10 hover:text-primary",
                  isActive(item.href) ? "bg-primary/10 text-primary font-semibold" : ""
                )}
              >
                <Link href={item.href} className="flex items-center gap-2 px-3 py-2">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hi, {user.name || user.email?.split('@')[0]}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoading} aria-label="Logout" className="hidden md:inline-flex">
              <LogOut className="h-5 w-5 text-accent hover:text-accent/80" />
            </Button>
            
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                     <SheetTitle>
                        <Link href="/dashboard" className="flex items-center gap-2 text-primary" onClick={() => setIsSheetOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12a10 10 0 0 0-7.07 2.93A9.96 9.96 0 0 0 12 22a10 10 0 0 0 10-10h-10z"></path></svg>
                          <span className="font-headline text-lg font-bold">Soloura</span>
                        </Link>
                      </SheetTitle>
                    {/* The explicit SheetClose button that was here has been removed */}
                  </SheetHeader>
                  <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary",
                            isActive(item.href) ? "bg-primary/10 text-primary" : ""
                          )}
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="p-4 border-t mt-auto">
                    {user && (
                      <div className="text-sm text-muted-foreground mb-3">
                        Hi, {user.name || user.email?.split('@')[0]}
                      </div>
                    )}
                    <SheetClose asChild>
                        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading} className="w-full justify-start border-accent text-accent hover:bg-accent/10">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
