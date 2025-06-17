
'use client'; // Required for usePathname

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';
import type { Metadata } from 'next'; // Import for type safety if using generateMetadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Static metadata can be defined here if this were a Server Component,
// or if not using 'use client' directly in this RootLayout.
// For dynamic titles in a 'use client' layout, manage via <title> tag or effects.
// export const metadata: Metadata = {
//   title: 'ContractEase',
//   description: 'Automate contract filling and AI-powered clause generation.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // Determine page title dynamically
  // This is a simple way; for more complex apps, consider Next.js metadata API with generateMetadata in page/layout server components
  let pageTitle = 'ContractEase';
  if (isLoginPage) {
    pageTitle = 'Login - ContractEase';
  } else if (pathname === '/opportunities') {
    pageTitle = 'Opportunities - ContractEase';
  } else if (pathname && pathname.startsWith('/editor')) {
    pageTitle = 'Contract Editor - ContractEase';
  }
  
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning often useful with client-side dynamic content */}
      <head>
        <title>{pageTitle}</title>
        {/* Standard meta description, can also be made dynamic */}
        <meta name="description" content="Streamline your contract management with AI-powered tools and efficient workflows." />
        {/* Add other common head elements like favicons, etc. here */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {isLoginPage ? (
          children // LoginPage does not use AppLayout
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
