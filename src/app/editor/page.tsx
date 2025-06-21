
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
import { EditableTable } from '@/components/contract/editable-table';


function ContractEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const opportunityName = searchParams.get('opportunityName') || 'Unnamed Opportunity';
  const contractId = searchParams.get('contractId');
  const contractType = searchParams.get('contractType');

  const [cells, setCells] = useState<ContractCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    if (!contractId) {
        setIsLoading(false);
        toast({ title: 'Error', description: 'No se proporcionó un ID de oportunidad.', variant: 'destructive' });
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
        setCells(template.generateCells({}));
        return;
    }

    setIsLoading(true);

    // --- 1. Load initial data from the source to get IDs and fallback data ---
    let contractDetails: any;
    try {
        const response = await fetch('https://magicloops.dev/api/loop/1c7ea39e-d598-42f8-8db7-1f84ebe37135/run');
        if (!response.ok) throw new Error(`Error al buscar datos: ${response.statusText}`);
        const allContracts = await response.json();
        contractDetails = allContracts.find((c: any) => c.id_oportunidad === contractId);

        if (!contractDetails) {
            throw new Error(`No se encontraron datos para el ID ${contractId}.`);
        }
        setContractData(contractDetails);
    } catch (error) {
        console.error("Failed to load initial contract data:", error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudieron cargar los datos del contrato.';
        toast({ title: 'Error al Cargar Contrato', description: `${errorMessage} Usando plantilla en blanco.`, variant: 'destructive' });
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
        setCells(template.generateCells({}));
        setIsLoading(false);
        return;
    }

    // --- 2. Try to load saved progress ---
    let progressLoaded = false;
    try {
        const progressResponse = await fetch('https://magicloops.dev/api/loop/6b6a524c-dc85-401b-bcb3-a99daa6283eb/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_oportunidad: contractId,
                id_contrato: contractDetails.id_contrato
            })
        });

        if (progressResponse.ok) {
            const result = await progressResponse.json();
            // API might return an array with one object, or just the object. Handle both.
            const savedData = Array.isArray(result) ? result[0] : result;
            
            if (savedData && savedData.avance_json && savedData.avance_json.cells && savedData.avance_json.cells.length > 0) {
                setCells(savedData.avance_json.cells);
                toast({ title: 'Progreso Cargado', description: 'Se ha restaurado tu último avance guardado.' });
                progressLoaded = true;
            }
        }
    } catch (error) {
        console.warn("No saved progress found or failed to load, proceeding to generate new contract.", error);
    }

    // --- 3. If no progress was loaded, generate from template ---
    if (!progressLoaded) {
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
        const initialCells = template.generateCells(contractDetails);
        setCells(initialCells);
        toast({ title: 'Contrato Generado', description: 'Se ha generado un nuevo contrato desde la plantilla.' });
    }

    setIsLoading(false);
  }, [contractId, contractType, toast]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);
  
  const updateCellContent = (id: string, newContent: string) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, content: newContent } : cell));
  };

  const deleteCell = (id: string) => {
    setCells(cells.filter(cell => cell.id !== id));
    toast({ title: 'Sección Eliminada' });
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
      title: 'Nueva Sección',
      content: text,
    };
    const newCells = [...cells];
    const insertAtIndex = index !== undefined ? index + 1 : cells.length;
    newCells.splice(insertAtIndex, 0, newCell);
    setCells(newCells);
  };

  const handleSave = async () => {
    if (!contractId || !contractData?.id_contrato) {
      toast({ title: 'Error al Guardar', description: 'No hay un ID de contrato u oportunidad para guardar.', variant: 'destructive' });
      return;
    }
    
    setIsSaving(true);
    toast({ title: 'Guardando...', description: 'Tu progreso está siendo guardado.' });

    const payload = {
      id_oportunidad: contractId,
      id_contrato: contractData.id_contrato,
      avance_json: { cells },
    };

    try {
      const response = await fetch('https://magicloops.dev/api/loop/d3200bc0-87ba-431e-a93b-e2245b612d09/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con el estado ${response.status}`);
      }
      
      toast({ title: 'Contrato Guardado', description: 'Tu avance ha sido guardado exitosamente.' });
    } catch (error) {
      console.error("Failed to save contract:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast({ title: 'Falló el Guardado', description: `No se pudo guardar el progreso. ${errorMessage}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenumber = async () => {
    setIsRenumbering(true);
    toast({ title: 'Renumerando contrato...', description: 'La IA está reordenando los números de las cláusulas.' });

    const SEPARATOR = "\n\n---CELL-BREAK---\n\n";
    const combinedText = cells.map(c => c.content).join(SEPARATOR);

    try {
        const result = await renumberContract({ contractText: combinedText });

        if (!result.renumberedContractText) {
            throw new Error("La IA devolvió una respuesta vacía.");
        }

        const renumberedParts = result.renumberedContractText.split('---CELL-BREAK---');

        if (renumberedParts.length === cells.length) {
            const updatedCells = cells.map((cell, index) => ({
                ...cell,
                content: renumberedParts[index].trim(),
            }));
            setCells(updatedCells);
            toast({ title: 'Contrato Renumerado', description: 'Las cláusulas y referencias cruzadas han sido actualizadas.' });
        } else {
            console.error("La IA no preservó la estructura de las celdas. Fusionando en una sola celda.");
            const singleCell: ContractCell = {
                id: `cell-${Date.now()}`,
                content: result.renumberedContractText,
            };
            setCells([singleCell]);
             toast({ 
                title: 'Contrato Renumerado y Fusionado', 
                description: 'Las cláusulas fueron actualizadas pero la estructura de celdas no pudo ser preservada.',
            });
        }
    } catch (error) {
        console.error("Failed to renumber contract:", error);
        toast({ title: 'Falló la Renumeración', description: 'No se pudieron renumerar las cláusulas del contrato.', variant: 'destructive' });
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
      toast({ title: 'Falló la Reescritura', description: 'No se pudo reescribir la cláusula.', variant: 'destructive' });
    } finally {
      setIsClauseRewriting(false);
    }
  };

  const handleAcceptRewrite = () => {
    if (rewritingCell && rewrittenText) {
      updateCellContent(rewritingCell.id, rewrittenText);
      handleCloseRewriteDialog();
      toast({ title: 'Sección Actualizada', description: 'La sección ha sido actualizada con la sugerencia de la IA.' });
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
              <Button onClick={handleRenumber} disabled={isRenumbering || isSaving} variant="outline">
                  {isRenumbering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Renumerar
              </Button>
              <Button onClick={handleSave} disabled={isRenumbering || isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Avance
              </Button>
          </div>
      </div>


      <div className="space-y-4 contract-notebook">
        {cells.map((cell, index) => (
          <Card key={cell.id} className="group/cell relative transition-shadow hover:shadow-lg">
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-background/50 backdrop-blur-sm rounded-md p-1 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenRewriteDialog(cell)} disabled={isRenumbering || isSaving} title="Reescribir con IA">
                  <Wand2 className="h-4 w-4 text-accent" />
               </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'up')} disabled={index === 0 || isRenumbering || isSaving} title="Mover Arriba">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'down')} disabled={index === cells.length - 1 || isRenumbering || isSaving} title="Mover Abajo">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCell(cell.id)} disabled={isRenumbering || isSaving} title="Eliminar Sección">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
             <CardContent className="p-4">
               {cell.title && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-2">{cell.title}</h3>
                )}
                {cell.content.trim().startsWith('<table') ? (
                  <EditableTable
                    htmlContent={cell.content}
                    onContentChange={(newContent) => updateCellContent(cell.id, newContent)}
                    disabled={isRenumbering || isSaving}
                  />
                ) : (
                  <Textarea
                      value={cell.content}
                      onChange={(e) => updateCellContent(cell.id, e.target.value)}
                      className="w-full h-auto min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base font-serif"
                      onInput={handleAutoResizeTextarea}
                      disabled={isRenumbering || isSaving}
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
                )}
            </CardContent>
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-10">
                 <Button variant="outline" size="sm" className="rounded-full bg-background hover:bg-secondary shadow-md" onClick={() => addCell('Nueva sección editable...', index)} disabled={isRenumbering || isSaving}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Añadir Sección Abajo
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
              Reescribir Sección con IA
            </DialogTitle>
            <DialogDescription>
              Describe cómo te gustaría cambiar esta sección, y la IA sugerirá una revisión.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium">Texto Original</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">{rewritingCell?.content}</p>
              </CardContent>
            </Card>
            
            <Textarea
              id="rewrite-instruction"
              placeholder="Ej: 'Hacer esto más formal' o 'Añadir una frase sobre las penalizaciones por terminación.'"
              value={rewriteInstruction}
              onChange={(e) => setRewriteInstruction(e.target.value)}
              rows={3}
              disabled={isClauseRewriting}
            />
            <Button onClick={handleRewriteClause} disabled={isClauseRewriting || !rewriteInstruction.trim()}>
              {isClauseRewriting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generar Sugerencia
            </Button>

            {rewrittenText && (
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">Revisión Sugerida</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{rewrittenText}</p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseRewriteDialog}>Cancelar</Button>
            <Button onClick={handleAcceptRewrite} disabled={!rewrittenText || isClauseRewriting}>
              Aceptar y Actualizar Sección
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
