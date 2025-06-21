
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Trash2, ArrowUp, ArrowDown, PlusCircle, Save, RefreshCw, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { ContractCell } from '@/components/contract/types';
import { defaultTemplates } from '@/lib/templates';
import { ContractPreview } from '@/components/contract/contract-preview';
import { renumberContract } from '@/ai/flows/renumber-contract-flow';
import { rewriteContractClause } from '@/ai/flows/rewrite-contract-clause';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


function ContractEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const opportunityName = searchParams.get('opportunityName') || 'Unnamed Opportunity';
  const contractId = searchParams.get('contractId');
  const contractType = searchParams.get('contractType');

  const [cells, setCells] = useState<ContractCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenumbering, setIsRenumbering] = useState(false);
  const [contractData, setContractData] = useState<Record<string, any> | null>(null);
  
  const [currentContractType, setCurrentContractType] = useState(contractType);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [nextContractType, setNextContractType] = useState<string | null>(null);

  // State for the AI rewriter
  const [rewritingCell, setRewritingCell] = useState<ContractCell | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isClauseRewriting, setIsClauseRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);


  const loadContract = useCallback(async () => {
    setIsLoading(true);
    try {
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
        let fetchedData: Record<string, any> = {};

        if (contractId) {
            const response = await fetch('https://magicloops.dev/api/loop/1c7ea39e-d598-42f8-8db7-1f84ebe37135/run');
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            const allContracts = await response.json();
            const contractDetails = allContracts.find((c: any) => c.id_portunidad === contractId);

            if (contractDetails) {
                fetchedData = contractDetails;
                setContractData(fetchedData);
                toast({ title: 'Data Loaded', description: 'Contract data has been loaded from the backend.' });
            } else {
                toast({ title: 'Contract Not Found', description: `No contract data found for opportunity ID ${contractId}. Using a blank template.`, variant: 'destructive' });
            }
        }
        
        const initialCells = template.generateCells(fetchedData || {});
        setCells(initialCells);

    } catch (error) {
        console.error("Failed to load contract data:", error);
        const errorMessage = error instanceof Error ? error.message : 'Could not load contract data.';
        toast({ title: 'Error Loading Contract', description: `${errorMessage} Using a blank template.`, variant: 'destructive' });
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
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
    [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
    setCells(newCells);
  };

  const addCell = (text: string, index?: number) => {
    const newCell: ContractCell = {
      id: `cell-${Date.now()}-${Math.random()}`,
      title: 'New Section',
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

  const handleRenumber = async () => {
    setIsRenumbering(true);
    toast({ title: 'Renumbering contract...', description: 'AI is tidying up the clause numbers.' });

    const SEPARATOR = "\n\n---CELL-BREAK---\n\n";
    const combinedText = cells.map(c => c.content).join(SEPARATOR);

    try {
        const result = await renumberContract({ contractText: combinedText });

        if (!result.renumberedContractText) {
            throw new Error("AI returned an empty response.");
        }

        const renumberedParts = result.renumberedContractText.split('---CELL-BREAK---');

        if (renumberedParts.length === cells.length) {
            const updatedCells = cells.map((cell, index) => ({
                ...cell,
                content: renumberedParts[index].trim(),
            }));
            setCells(updatedCells);
            toast({ title: 'Contract Renumbered', description: 'Clauses and cross-references have been updated.' });
        } else {
            console.error("AI did not preserve cell structure. Merging into a single cell.");
            const singleCell: ContractCell = {
                id: `cell-${Date.now()}`,
                content: result.renumberedContractText,
            };
            setCells([singleCell]);
             toast({ 
                title: 'Contract Renumbered & Merged', 
                description: 'Clauses were updated but the cell structure could not be preserved.',
            });
        }
    } catch (error) {
        console.error("Failed to renumber contract:", error);
        toast({ title: 'Renumbering Failed', description: 'Could not renumber the contract clauses.', variant: 'destructive' });
    } finally {
        setIsRenumbering(false);
    }
  };

  const handleAutoResizeTextarea = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleContractTypeChange = (newType: string) => {
    if (newType !== currentContractType) {
      setNextContractType(newType);
      setIsConfirmDialogOpen(true);
    }
  };

  const confirmContractTypeChange = () => {
    if (!nextContractType) return;

    const newTemplate = defaultTemplates.find(t => t.name.includes(nextContractType)) || defaultTemplates[0];
    const newCells = newTemplate.generateCells(contractData || {});
    setCells(newCells);
    setCurrentContractType(nextContractType);
    
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('contractType', nextContractType);
    router.replace(`/editor?${newParams.toString()}`, { scroll: false });
    
    toast({
      title: 'Plantilla Cambiada',
      description: `Se ha cargado la plantilla para ${newTemplate.name}.`
    });

    setIsConfirmDialogOpen(false);
    setNextContractType(null);
  };


  // Handlers for the rewriter dialog
  const handleOpenRewriteDialog = (cell: ContractCell) => {
    setRewritingCell(cell);
    setRewriteInstruction('');
    setRewrittenText(null);
  };

  const handleCloseRewriteDialog = () => {
    setRewritingCell(null);
  };

  const handleRewriteClause = async () => {
    if (!rewritingCell || !rewriteInstruction) return;

    setIsClauseRewriting(true);
    setRewrittenText(null);
    try {
      const result = await rewriteContractClause({
        clauseText: rewritingCell.content,
        rewriteInstruction: rewriteInstruction,
      });
      setRewrittenText(result.rewrittenClauseText);
    } catch (error) {
      console.error("Failed to rewrite clause:", error);
      toast({ title: 'Rewrite Failed', description: 'Could not rewrite the clause.', variant: 'destructive' });
    } finally {
      setIsClauseRewriting(false);
    }
  };

  const handleAcceptRewrite = () => {
    if (rewritingCell && rewrittenText) {
      updateCellContent(rewritingCell.id, rewrittenText);
      handleCloseRewriteDialog();
      toast({ title: 'Section Updated', description: 'The section has been updated with the AI suggestion.' });
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{opportunityName}</h1>
        {contractId && <p className="text-sm text-muted-foreground mt-1">ID de Oportunidad: {contractId}</p>}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
              <Label htmlFor="contract-type-select" className="font-medium">Tipo de Contrato:</Label>
              <Select value={currentContractType || undefined} onValueChange={handleContractTypeChange}>
                  <SelectTrigger id="contract-type-select" className="w-[300px]">
                      <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="NDA">Acuerdo de Confidencialidad (NDA)</SelectItem>
                      <SelectItem value="Servicios">Contrato de Servicios</SelectItem>
                      <SelectItem value="SaaS">Contrato SaaS</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
              <Button onClick={handleRenumber} disabled={isRenumbering} variant="outline">
                  {isRenumbering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Renumber
              </Button>
              <Button onClick={handleSave} disabled={isRenumbering}>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Exit
              </Button>
          </div>
      </div>


      <div className="space-y-4 contract-notebook">
        {cells.map((cell, index) => (
          <Card key={cell.id} className="group/cell relative transition-shadow hover:shadow-lg">
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-background/50 backdrop-blur-sm rounded-md p-1 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenRewriteDialog(cell)} disabled={isRenumbering} title="Rewrite with AI">
                  <Wand2 className="h-4 w-4 text-accent" />
               </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'up')} disabled={index === 0 || isRenumbering} title="Move Up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'down')} disabled={index === cells.length - 1 || isRenumbering} title="Move Down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCell(cell.id)} disabled={isRenumbering} title="Delete Section">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
             <CardContent className="p-4">
               {cell.title && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-2">{cell.title}</h3>
                )}
                <Textarea
                    value={cell.content}
                    onChange={(e) => updateCellContent(cell.id, e.target.value)}
                    className="w-full h-auto min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base font-serif"
                    onInput={handleAutoResizeTextarea}
                    disabled={isRenumbering}
                    ref={node => {
                        if (node) {
                            if (!node.dataset.resized) {
                                node.style.height = 'auto';
                                node.style.height = `${node.scrollHeight}px`;
                                node.dataset.resized = "true";
                            }
                        }
                    }}
                />
            </CardContent>
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-10">
                 <Button variant="outline" size="sm" className="rounded-full bg-background hover:bg-secondary shadow-md" onClick={() => addCell('New editable section...', index)} disabled={isRenumbering}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Add Section Below
                 </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-12">
        <ContractPreview cells={cells} data={contractData} />
      </div>

      <Dialog open={!!rewritingCell} onOpenChange={(isOpen) => !isOpen && handleCloseRewriteDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-accent" />
              Rewrite Section with AI
            </DialogTitle>
            <DialogDescription>
              Describe how you'd like to change this section, and the AI will suggest a revision.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium">Original Text</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">{rewritingCell?.content}</p>
              </CardContent>
            </Card>
            
            <Textarea
              id="rewrite-instruction"
              placeholder="e.g., 'Make this more formal' or 'Add a sentence about termination fees.'"
              value={rewriteInstruction}
              onChange={(e) => setRewriteInstruction(e.target.value)}
              rows={3}
              disabled={isClauseRewriting}
            />
            <Button onClick={handleRewriteClause} disabled={isClauseRewriting || !rewriteInstruction.trim()}>
              {isClauseRewriting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Suggestion
            </Button>

            {rewrittenText && (
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">Suggested Revision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{rewrittenText}</p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseRewriteDialog}>Cancel</Button>
            <Button onClick={handleAcceptRewrite} disabled={!rewrittenText || isClauseRewriting}>
              Accept and Update Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambio de plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto reemplazará el contenido actual del contrato con la nueva plantilla seleccionada. Cualquier cambio no guardado se perderá. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNextContractType(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmContractTypeChange}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
