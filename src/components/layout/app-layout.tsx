
"use client";

import React from 'react';
import Link from 'next/link';

import { CovaltoLogo } from '@/components/icons/covalto-logo';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-gray-100/90 backdrop-blur-sm dark:bg-gray-950/90">
        <div className="max-w-screen-xl mx-auto w-full grid grid-cols-3 h-16 items-center px-6">
          <div className="flex items-center justify-start">
            <Link href="/opportunities" className="flex items-center space-x-2">
              <CovaltoLogo className="h-auto w-32" />
            </Link>
          </div>
          
          {/* This empty div acts as a spacer to center the content */}
          <div></div>

          <div className="flex items-center justify-end space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                    <Settings />
                    <span className="sr-only">Settings</span>
                </Link>
              </Button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-screen-xl mx-auto px-6 flex-1">
        <main className="py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
