
'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Trash2, ArrowUp, ArrowDown, PlusCircle, Save, RefreshCw, Wand2, ArrowLeft, Volume2, ListTree } from 'lucide-react';
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
import { suggestContractClause } from '@/ai/flows/suggest-contract-clause';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EditableTable } from '@/components/contract/editable-table';
import { Switch } from '@/components/ui/switch';


function ContractEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const opportunityName = searchParams.get('opportunityName') || 'Oportunidad sin Nombre';
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

  // State for delete confirmation
  const [cellToDeleteId, setCellToDeleteId] = useState<string | null>(null);

  // State for the AI rewriter
  const [rewritingCell, setRewritingCell] = useState<ContractCell | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isClauseRewriting, setIsClauseRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  
  // State for the AI clause suggester
  const [isClauseSuggesterOpen, setIsClauseSuggesterOpen] = useState(false);
  const [clauseSuggestionDescription, setClauseSuggestionDescription] = useState('');
  const [isSuggestingClause, setIsSuggestingClause] = useState(false);
  const [suggestedClauseText, setSuggestedClauseText] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);

  // State for section manager
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);

  const visibleCellIds = useMemo(() => cells.filter(c => c.visible).map(c => c.id), [cells]);

  const loadContract = useCallback(async () => {
    if (!contractId) {
        setIsLoading(false);
        toast({ title: 'Error', description: 'No se proporcionó un ID de oportunidad.', variant: 'destructive' });
        const template = defaultTemplates.find(t => t.name.includes(contractType || '')) || defaultTemplates[0];
        setCells(template.generateCells({}).map(c => ({...c, visible: true})));
        return;
    }

    setIsLoading(true);

    let templateDataSource: Record<string, any> = {};

    // --- 1. Fetch detailed data for populating the contract template ---
    try {
        const detailedResponse = await fetch('https://magicloops.dev/api/loop/1c7ea39e-d598-42f8-8db7-1f84ebe37135/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_portunidad: contractId }),
        });
        
        if (detailedResponse.ok) {
             const data = await detailedResponse.json();
             if (data && Object.keys(data).length > 0) {
                templateDataSource = data;
             }
        } else {
            console.warn(`Could not fetch detailed data (Status: ${detailedResponse.status}), will generate from a blank template.`);
        }
    } catch (error) {
        console.error("Error fetching detailed contract data. A blank template will be generated.", error);
    }
    
    // Set contractData for display purposes (e.g., header title)
    setContractData(templateDataSource);


    // --- 2. Try to load saved progress ---
    let progressLoaded = false;
    try {
        const progressResponse = await fetch('https://magicloops.dev/api/loop/6b6a524c-dc85-401b-bcb3-a99daa6283eb/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_oportunidad: contractId })
        });

        if (progressResponse.ok) {
            const result = await progressResponse.json();
            const savedData = Array.isArray(result) ? result[0] : result;
            
            if (savedData && savedData.avance_json && savedData.avance_json.cells && savedData.avance_json.cells.length > 0) {
                const loadedCells = savedData.avance_json.cells.map((c: ContractCell) => ({ ...c, visible: c.visible !== false }));
                setCells(loadedCells);
                toast({ title: 'Progreso Cargado', description: 'Se ha restaurado tu último avance guardado.' });
                progressLoaded = true;
            }
        }
    } catch (error) {
        console.warn("No saved progress found or failed to load, proceeding to generate new contract.", error);
    }

    // --- 3. If no progress was loaded, generate from template ---
    if (!progressLoaded) {
        const template = defaultTemplates.find(t => t.name.includes(currentContractType || '')) || defaultTemplates[0];
        const initialCells = template.generateCells(templateDataSource).map(c => ({...c, visible: true}));
        setCells(initialCells);
        if (Object.keys(templateDataSource).length > 0) {
            toast({ title: 'Contrato Generado', description: `Se ha generado un nuevo contrato para ${template.name}.` });
        } else {
             toast({ title: 'Plantilla Cargada', description: `Inicia un nuevo contrato para ${template.name}.` });
        }
    }

    setIsLoading(false);
  }, [contractId, currentContractType, toast]);


  useEffect(() => {
    loadContract();
  }, [loadContract]);
  
  const updateCellContent = (id: string, newContent: string) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, content: newContent } : cell));
  };

  const requestDeleteCell = (id: string) => {
    setCellToDeleteId(id);
  };

  const confirmDeleteCell = () => {
    if (!cellToDeleteId) return;
    setCells(cells.filter(cell => cell.id !== cellToDeleteId));
    toast({ title: 'Sección Eliminada' });
    setCellToDeleteId(null);
  };

  const moveCell = (index: number, direction: 'up' | 'down') => {
    const visibleIndex = visibleCellIds.indexOf(cells[index].id);

    if ((direction === 'up' && visibleIndex === 0) || (direction === 'down' && visibleIndex === visibleCellIds.length - 1)) {
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
      visible: true,
    };
    const newCells = [...cells];
    const insertAtIndex = index !== undefined ? index + 1 : cells.length;
    newCells.splice(insertAtIndex, 0, newCell);
    setCells(newCells);
  };

  const handleSave = async () => {
    if (!contractId) {
      toast({ title: 'Error al Guardar', description: 'No hay un ID de contrato u oportunidad para guardar.', variant: 'destructive' });
      return;
    }
    
    setIsSaving(true);
    toast({ title: 'Guardando...', description: 'Tu progreso está siendo guardado.' });

    const payload = {
      id_oportunidad: contractId,
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
    const combinedText = cells.filter(c => c.visible).map(c => c.content).join(SEPARATOR);

    try {
        const result = await renumberContract({ contractText: combinedText });

        if (!result.renumberedContractText) {
            throw new Error("La IA devolvió una respuesta vacía.");
        }

        const renumberedParts = result.renumberedContractText.split('---CELL-BREAK---');
        const visibleCellsToUpdate = cells.filter(c => c.visible);

        if (renumberedParts.length === visibleCellsToUpdate.length) {
            const updatedCells = cells.map(cell => {
                if (!cell.visible) return cell;
                const visibleIndex = visibleCellsToUpdate.findIndex(c => c.id === cell.id);
                return {
                    ...cell,
                    content: renumberedParts[visibleIndex].trim(),
                };
            });
            setCells(updatedCells);
            toast({ title: 'Contrato Renumerado', description: 'Las cláusulas y referencias cruzadas han sido actualizadas.' });
        } else {
            console.error("La IA no preservó la estructura de las celdas. No se aplicaron cambios.");
             toast({ 
                title: 'Error en Renumeración', 
                description: 'La estructura devuelta por la IA no coincide con las secciones visibles. No se aplicaron los cambios.',
                variant: 'destructive',
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
    
    setCurrentContractType(nextContractType);
    
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('contractType', nextContractType);
    router.replace(`/editor?${newParams.toString()}`, { scroll: false });
    
    const newTemplate = defaultTemplates.find(t => t.name.includes(nextContractType)) || defaultTemplates[0];
    toast({
      title: 'Plantilla Cambiada',
      description: `Cargando la plantilla para ${newTemplate.name}.`
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
  
    // Handlers for the new clause suggester dialog
  const handleOpenClauseSuggester = () => {
    setClauseSuggestionDescription('');
    setSuggestedClauseText(null);
    setAudioDataUri(null);
    setIsClauseSuggesterOpen(true);
  };

  const handleSuggestClause = async () => {
    if (!clauseSuggestionDescription) return;
    setIsSuggestingClause(true);
    setSuggestedClauseText(null);
    setAudioDataUri(null);
    try {
      const { suggestedClause } = await suggestContractClause({ clauseDescription: clauseSuggestionDescription });
      setSuggestedClauseText(suggestedClause);
    } catch (error) {
      console.error("Failed to suggest clause:", error);
      toast({ title: 'Falló la Sugerencia', description: 'No se pudo generar la cláusula.', variant: 'destructive' });
    } finally {
      setIsSuggestingClause(false);
    }
  };

  const handleListenToClause = async () => {
    if (!suggestedClauseText) return;
    setIsGeneratingAudio(true);
    setAudioDataUri(null);
    try {
      const { media } = await textToSpeech(suggestedClauseText);
      setAudioDataUri(media);
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast({ title: 'Falló el Audio', description: 'No se pudo generar el audio para la cláusula.', variant: 'destructive' });
    } finally {
      setIsGeneratingAudio(false);
    }
  }

  const handleAddSuggestedClause = () => {
    if (suggestedClauseText) {
      addCell(suggestedClauseText);
      setIsClauseSuggesterOpen(false);
      toast({ title: 'Sección Añadida', description: 'La cláusula sugerida por la IA ha sido añadida al final del contrato.' });
    }
  };

  const toggleCellVisibility = (id: string, checked: boolean) => {
    setCells(cells.map(cell =>
      cell.id === id ? { ...cell, visible: checked } : cell
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push('/opportunities')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a Oportunidades</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{contractData?.nombre_oportunidad || opportunityName}</h1>
            {contractId && <p className="text-sm text-muted-foreground mt-1">ID de Oportunidad: {contractId}</p>}
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
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
              <Button onClick={handleOpenClauseSuggester} variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                Sugerir Cláusula
              </Button>
              <Button onClick={() => setIsSectionManagerOpen(true)} variant="outline">
                <ListTree className="mr-2 h-4 w-4" />
                Gestionar Secciones
              </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8 items-start">
        {/* Editor Column */}
        <div className="space-y-4 contract-notebook">
          {cells.map((cell, index) => {
            if (!cell.visible) return null;
            
            const visibleIndex = visibleCellIds.indexOf(cell.id);

            return (
              <Card key={cell.id} className="group/cell relative transition-shadow hover:shadow-lg">
                <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-background/50 backdrop-blur-sm rounded-md p-1 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenRewriteDialog(cell)} disabled={isRenumbering || isSaving} title="Reescribir con IA">
                      <Wand2 className="h-4 w-4 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'up')} disabled={visibleIndex === 0 || isRenumbering || isSaving} title="Mover Arriba">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCell(index, 'down')} disabled={visibleIndex === visibleCellIds.length - 1 || isRenumbering || isSaving} title="Mover Abajo">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => requestDeleteCell(cell.id)} disabled={isRenumbering || isSaving} title="Eliminar Sección">
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
            )
          })}
        </div>
        
        {/* Preview Column */}
        <div className="lg:sticky lg:top-24">
          <ContractPreview cells={cells} data={contractData} />
        </div>
      </div>

      <Dialog open={isSectionManagerOpen} onOpenChange={setIsSectionManagerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ListTree className="mr-2 h-6 w-6 text-accent" />
              Gestionar Secciones del Contrato
            </DialogTitle>
            <DialogDescription>
              Activa o desactiva las secciones que deseas incluir en el documento final.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
              {cells.map((cell) => (
                <div key={cell.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <Label htmlFor={`switch-${cell.id}`} className="flex-1 pr-4 cursor-pointer">
                    <p className="font-semibold">{cell.title || "Sección sin título"}</p>
                  </Label>
                  <Switch
                    id={`switch-${cell.id}`}
                    checked={cell.visible}
                    onCheckedChange={(checked) => toggleCellVisibility(cell.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSectionManagerOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isClauseSuggesterOpen} onOpenChange={setIsClauseSuggesterOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-accent" />
              Añadir Cláusula con IA
            </DialogTitle>
            <DialogDescription>
              Describe la cláusula que necesitas y la IA redactará una sugerencia para ti. También puedes escucharla antes de añadirla.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="suggestion-description"
              placeholder="Ej: 'Una cláusula sobre la terminación anticipada del contrato con 30 días de preaviso.'"
              value={clauseSuggestionDescription}
              onChange={(e) => setClauseSuggestionDescription(e.target.value)}
              rows={3}
              disabled={isSuggestingClause}
            />
            <Button onClick={handleSuggestClause} disabled={isSuggestingClause || !clauseSuggestionDescription.trim()}>
              {isSuggestingClause ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generar Sugerencia
            </Button>

            {suggestedClauseText && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">Cláusula Sugerida</CardTitle>
                  <Button onClick={handleListenToClause} size="sm" variant="ghost" disabled={isGeneratingAudio}>
                      {isGeneratingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                      Escuchar
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{suggestedClauseText}</p>
                  {audioDataUri && (
                      <div className="mt-4">
                          <audio controls autoPlay src={audioDataUri} className="w-full">
                              Tu navegador no soporta el elemento de audio.
                          </audio>
                      </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsClauseSuggesterOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddSuggestedClause} disabled={!suggestedClauseText || isSuggestingClause}>
              Añadir al Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      
      <AlertDialog open={!!cellToDeleteId} onOpenChange={(open) => !open && setCellToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta sección del contrato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCellToDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCell} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
