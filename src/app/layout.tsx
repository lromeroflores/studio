'use client'; // Required for usePathname

import React, { useEffect } from 'react'; // Added useEffect
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
// import type { Metadata } from 'next'; // Import for type safety if using generateMetadata

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // The login page is now the only page without the main AppLayout
  const isAuthPage = pathname === '/';

  useEffect(() => {
    // Apply theme from localStorage or system preference on initial client load
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      if (!storedTheme) {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (!storedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  // Determine page title dynamically
  let pageTitle = 'ContractEase';
  if (pathname === '/') {
    pageTitle = 'Login - ContractEase';
  } else if (pathname === '/opportunities') {
    pageTitle = 'Opportunities - ContractEase';
  } else if (pathname && pathname.startsWith('/editor')) {
    pageTitle = 'Contract Editor - ContractEase';
  } else if (pathname === '/settings') {
    pageTitle = 'Settings - ContractEase';
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content="Streamline your contract management with AI-powered tools and efficient workflows." />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
          {isAuthPage ? (
            children 
          ) : (
            <AppLayout>
              {children}
            </AppLayout>
          )}
          <Toaster />
      </body>
    </html>
  );
}
