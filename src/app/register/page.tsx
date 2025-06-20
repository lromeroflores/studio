
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Ban } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
            <Ban className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl mt-4">Registro Deshabilitado</CardTitle>
          <CardDescription>
            El registro de nuevos usuarios está deshabilitado en este momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/" className="font-medium text-primary hover:underline">
                Volver a la página de inicio
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
