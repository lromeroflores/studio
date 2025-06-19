
'use client'; // Required for usePathname

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
// import type { Metadata } from 'next'; // Import for type safety if using generateMetadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/register';

  // Determine page title dynamically
  let pageTitle = 'ContractEase';
  if (pathname === '/') {
    pageTitle = 'Login - ContractEase';
  } else if (pathname === '/register') {
    pageTitle = 'Register - ContractEase';
  } else if (pathname === '/opportunities') {
    pageTitle = 'Opportunities - ContractEase';
  } else if (pathname && pathname.startsWith('/editor')) {
    pageTitle = 'Contract Editor - ContractEase';
  } else if (pathname === '/profile') {
    pageTitle = 'User Profile - ContractEase';
  } else if (pathname === '/settings') {
    pageTitle = 'Settings - ContractEase';
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content="Streamline your contract management with AI-powered tools and efficient workflows." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
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
