
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/services/firestore-service';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile displayName
      await updateProfile(user, { displayName: name });
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, { name, email });

      toast({
        title: 'Registro Exitoso',
        description: 'Tu cuenta ha sido creada. Por favor, inicia sesión.',
      });
      router.push('/'); 

    } catch (err: any) {
      console.error("Firebase Registration Error:", err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error inesperado durante el registro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/40 selection:text-white animate-fade-in">
      <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/E0E7FF/003A70/png?text=Secure+Registration')] bg-cover bg-center opacity-10 dark:opacity-5" data-ai-hint="security privacy"></div>
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
          <CardTitle className="text-2xl font-bold text-foreground">Crear Nueva Cuenta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Completa el formulario para registrarte.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/80 focus:bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/80 focus:bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">Contraseña</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
              <Link href="/" className="font-medium text-primary hover:underline">
                Inicia sesión aquí
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
