
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2, ArrowUp, ArrowDown, PlusCircle, Save, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIClauseGenerator } from '@/components/contract/ai-clause-generator';
import type { ContractCell } from '@/components/contract/types';
import { defaultTemplates } from '@/lib/templates';
import { fetchContractDataFromBigQuery, type FetchContractDataOutput } from '@/ai/flows/fetch-contract-data-from-bigquery';

function ContractEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const opportunityName = searchParams.get('opportunityName') || 'Unnamed Opportunity';
  const contractId = searchParams.get('contractId');
  const contractType = searchParams.get('contractType');

  const [cells, setCells] = useState<ContractCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadContract = useCallback(async () => {
    setIsLoading(true);
    try {
      const template = defaultTemplates.find(t => t.name === contractType) || defaultTemplates[0];
      let fetchedData: FetchContractDataOutput = {};

      if (contractId) {
        fetchedData = await fetchContractDataFromBigQuery({ recordId: contractId });
        if(fetchedData) {
            toast({ title: 'Data Loaded', description: 'Contract data has been loaded from the backend.' });
        }
      }
      
      const initialCells = template.generateCells(fetchedData || {});
      setCells(initialCells);

    } catch (error) {
        console.error("Failed to load contract data:", error);
        toast({ title: 'Error Loading Contract', description: 'Could not load contract data. Using a blank template.', variant: 'destructive' });
        const template = defaultTemplates.find(t => t.name === contractType) || defaultTemplates[0];
        setCells(template.generateCells({}));
    } finally {
        setIsLoading(false);
    }
  }, [contractType, contractId, toast]);


  useEffect(() => {
    loadContract();
  }, [loadContract]);
  

  const updateCellContent = (id: string, newContent: string) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, content: newContent } : cell));
  };

  const deleteCell = (id: string) => {
    setCells(cells.filter(cell => cell.id !== id));
    toast({ title: 'Section Deleted' });
  };

  const moveCell = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === cells.length - 1)) {
        return;
    }
    
    const newCells = [...cells];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    // Simple swap
    [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
    setCells(newCells);
  };

  const addCell = (text: string, index?: number) => {
    const newCell: ContractCell = {
      id: `cell-${Date.now()}-${Math.random()}`,
      content: text,
    };
    const newCells = [...cells];
    const insertAtIndex = index !== undefined ? index + 1 : cells.length;
    newCells.splice(insertAtIndex, 0, newCell);
    setCells(newCells);
  };

  const handleSave = () => {
    toast({ title: 'Contract Saved', description: 'Your contract has been saved successfully.' });
    router.push('/opportunities');
  };

  const handleAutoResizeTextarea = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{opportunityName}</h1>
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save and Exit
        </Button>
      </div>

      <div className="space-y-4 contract-notebook">
        {cells.map((cell, index) => (
          <Card key={cell.id} className="group/cell relative transition-shadow hover:shadow-lg">
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-background/50 backdrop-blur-sm rounded-md p-1 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
               <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab" title="Reorder (Not implemented)">
                <GripVertical className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'up')} disabled={index === 0} title="Move Up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'down')} disabled={index === cells.length - 1} title="Move Down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCell(cell.id)} title="Delete Section">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
             <CardContent className="p-4">
               {cell.content.includes('<table') ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cell.content }} />
               ) : (
                <Textarea
                    value={cell.content}
                    onChange={(e) => updateCellContent(cell.id, e.target.value)}
                    className="w-full h-auto min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base font-serif"
                    onInput={handleAutoResizeTextarea}
                    // This useEffect-like logic inside the component helps set initial height
                    ref={node => {
                        if (node) {
                            // Run this only once on initial render
                            if (!node.dataset.resized) {
                                node.style.height = 'auto';
                                node.style.height = `${node.scrollHeight}px`;
                                node.dataset.resized = "true";
                            }
                        }
                    }}
                />
               )}
            </CardContent>
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-10">
                 <Button variant="outline" size="sm" className="rounded-full bg-background hover:bg-secondary shadow-md" onClick={() => addCell('New editable section...', index)}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Section Below
                 </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-12">
        <AIClauseGenerator onAddCell={(text) => addCell(text)} />
      </div>

    </div>
  );
}

export default function ContractEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <ContractEditorContent />
        </Suspense>
    );
}
