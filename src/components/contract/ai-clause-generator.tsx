'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, PlusCircle, Loader2 } from 'lucide-react';
import { suggestContractClause } from '@/ai/flows/suggest-contract-clause';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause } from './types';

interface AIClauseGeneratorProps {
  onAddClause: (clause: AdHocClause) => void;
}

export function AIClauseGenerator({ onAddClause }: AIClauseGeneratorProps) {
  const [clauseDescription, setClauseDescription] = useState('');
  const [suggestedClause, setSuggestedClause] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateClause = async () => {
    if (!clauseDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe the clause you want to generate.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSuggestedClause(null);
    try {
      const result = await suggestContractClause({ clauseDescription });
      setSuggestedClause(result.suggestedClause);
    } catch (error) {
      console.error('Error generating clause:', error);
      toast({
        title: 'AI Clause Generation Failed',
        description: 'Could not generate clause. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClause = () => {
    if (suggestedClause) {
      onAddClause({ id: Date.now().toString(), text: suggestedClause });
      setSuggestedClause(null);
      setClauseDescription(''); // Clear description after adding
      toast({
        title: 'Clause Added',
        description: 'The AI-generated clause has been added to your contract.',
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="mr-2 h-6 w-6 text-accent" />
          AI Clause Generator
        </CardTitle>
        <CardDescription>Describe the clause you need, and our AI will suggest legal wording.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., A clause about data protection compliance with GDPR..."
          value={clauseDescription}
          onChange={(e) => setClauseDescription(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
        <Button onClick={handleGenerateClause} disabled={isLoading || !clauseDescription.trim()} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate Clause
        </Button>
        {suggestedClause && (
          <Card className="mt-4 bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-md">Suggested Clause:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{suggestedClause}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddClause} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Contract
              </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
