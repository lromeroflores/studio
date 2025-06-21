
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {

    router.push('/opportunities');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4 selection:bg-primary/40 selection:text-white animate-fade-in">
      
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
          Acceda a sus oportunidades de contrato y herramientas de gestión.
          </CardDescription>
        </CardHeader>
          <CardContent className="py-6">
             <p className="text-center text-muted-foreground">
                Haga clic en el botón de abajo para continuar.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button onClick={handleLogin} className="w-full text-lg py-6">
              <LogIn className="mr-2 h-5 w-5" />
              Acceder al portal
            </Button>
          </CardFooter>
      </Card>
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400 z-10">
        &copy; {new Date().getFullYear()} Covalto ContractEase Inc. All rights reserved.
      </footer>
    </div>
  );
}
