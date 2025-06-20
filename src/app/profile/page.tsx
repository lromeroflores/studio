
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ban } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-3xl">
      <Card className="shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
            <Ban className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl mt-4">Página Deshabilitada</CardTitle>
          <CardDescription>
            La funcionalidad de perfiles de usuario ha sido deshabilitada.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
