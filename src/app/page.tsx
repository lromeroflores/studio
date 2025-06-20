
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!auth) {
      setError('Firebase is not configured correctly. Please check the console for more details.');
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/opportunities');
    } catch (err: any) {
      console.error("Firebase Login Error:", err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-api-key') {
        setError('Invalid email, password, or configuration. Please check credentials and Firebase setup.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/40 selection:text-white animate-fade-in">
      <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/E0E7FF/003A70/png?text=Corporate+Network')] bg-cover bg-center opacity-10 dark:opacity-5" data-ai-hint="finance technology"></div>
      
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm border-border/50 z-10">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://bancaenlinea.covalto.com/feb/common/styles/themes/images/covalto-login.png" 
              alt="Covalto Logo" 
              width="200" 
              height="auto" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Portal de Generación de Contratos</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your contract opportunities and management tools.
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
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿No tienes una cuenta? </span>
              <Link href="/register" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400 z-10">
        &copy; {new Date().getFullYear()} Covalto ContractEase Inc. All rights reserved.
      </footer>
    </div>
  );
}
