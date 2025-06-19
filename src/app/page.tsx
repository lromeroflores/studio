
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { CovaltoLogo } from '@/components/icons/covalto-logo'; // Import the new logo

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock login logic: simple validation
    if (email === 'analyst@example.com' && password === 'password') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      router.push('/opportunities');
    } else {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setError('Invalid email or password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/40 selection:text-white">
      <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/E0E7FF/003A70/png?text=Corporate+Network')] bg-cover bg-center opacity-10 dark:opacity-5" data-ai-hint="finance technology"></div>
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm border-border/50 z-10">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="flex justify-center mb-4">
            {/* Use the new CovaltoLogo component */}
            <CovaltoLogo width="200" height="auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Analyst Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your contract opportunities and management tools.
            <br />
            (Hint: analyst@example.com / password)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/80 focus:bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/80 focus:bg-background"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="pb-8">
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400 z-10">
        &copy; {new Date().getFullYear()} Covalto ContractEase Inc. All rights reserved.
      </footer>
    </div>
  );
}
