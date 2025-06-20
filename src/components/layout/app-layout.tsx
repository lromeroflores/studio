
"use client";

import React from 'react';
import Link from 'next/link';

import { CovaltoLogo } from '@/components/icons/covalto-logo';
import { MainNav } from './main-nav';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-gray-100/90 backdrop-blur-sm dark:bg-gray-950/90">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/opportunities" className="mr-6 flex items-center space-x-2">
              <CovaltoLogo className="h-auto w-32" />
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
             {/* This space can be used for other header items in the future, like a settings link */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                    <Settings />
                    <span className="sr-only">Settings</span>
                </Link>
              </Button>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <div className="h-full py-6 pr-6 lg:py-8">
              <MainNav />
            </div>
        </aside>
        <main className="flex-1 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
