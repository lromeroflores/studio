
'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo, memo } from 'react';
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
import { Label } from '@/components/ui/label';
import { EditableTable } from '@/components/contract/editable-table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/contract/rich-text-editor';

// New component for the Rewrite dialog, memoized for performance
const RewriteClauseDialog = memo(function RewriteClauseDialog({
  cell,
  onClose,
  onAccept,
  toast,
}: {
  cell: ContractCell | null;
  onClose: () => void;
  onAccept: (newText: string) => void;
  toast: (options: any) => void;
}) {
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isClauseRewriting, setIsClauseRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);

  // Reset state when the dialog is opened for a new cell
  useEffect(() => {
    if (cell) {
      setRewriteInstruction('');
      setRewrittenText(null);
    }
  }, [cell]);

  const handleRewriteClause = async () => {
    if (!cell || !rewriteInstruction) return;

    setIsClauseRewriting(true);
    setRewrittenText(null);
    try {
      const result = await rewriteContractClause({
        clauseText: cell.content,
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

  const handleAcceptAndClose = () => {
    if (rewrittenText) {
      onAccept(rewrittenText);
    }
  };
  
  return (
    <Dialog open={!!cell} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
              <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">{cell?.content}</p>
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
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAcceptAndClose} disabled={!rewrittenText || isClauseRewriting}>
            Aceptar y Actualizar Sección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
RewriteClauseDialog.displayName = 'RewriteClauseDialog';


// New component for the Suggester dialog, memoized for performance
const ClauseSuggesterDialog = memo(function ClauseSuggesterDialog({
  open,
  onOpenChange,
  cells,
  onAddClause,
  toast,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cells: ContractCell[];
  onAddClause: (newCell: ContractCell, position: string) => void;
  toast: (options: any) => void;
}) {
  const [clauseSuggestionDescription, setClauseSuggestionDescription] = useState('');
  const [isSuggestingClause, setIsSuggestingClause] = useState(false);
  const [suggestedClauseText, setSuggestedClauseText] = useState<string | null>(null);
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [insertAfterCellId, setInsertAfterCellId] = useState<string>('end');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);

  // Reset local state when dialog is closed to ensure it's fresh on next open
  useEffect(() => {
    if (!open) {
      setClauseSuggestionDescription('');
      setSuggestedClauseText(null);
      setNewClauseTitle('');
      setInsertAfterCellId('end');
      setAudioDataUri(null);
    }
  }, [open]);

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

  const handleAddAndClose = () => {
    if (!suggestedClauseText) {
      toast({ title: 'Error', description: 'Primero debe generar una sugerencia de cláusula.', variant: 'destructive' });
      return;
    }
    if (!newClauseTitle.trim()) {
        toast({ title: 'Falta el Título', description: 'Por favor, asígnale un título a la nueva sección.', variant: 'destructive' });
        return;
    }

    const newCell: ContractCell = {
      id: `cell-${Date.now()}-${Math.random()}`,
      title: newClauseTitle,
      content: suggestedClauseText,
      visible: true,
    };

    onAddClause(newCell, insertAfterCellId);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-6 w-6 text-accent" />
            Añadir Cláusula con IA
          </DialogTitle>
          <DialogDescription>
            Describe la cláusula que necesitas, asígnale un título y elige dónde insertarla en el contrato.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-2">
              <Label htmlFor="new-clause-title">Título de la Sección</Label>
              <Input
                  id="new-clause-title"
                  value={newClauseTitle}
                  onChange={(e) => setNewClauseTitle(e.target.value)}
                  placeholder="Ej: Cláusula de Jurisdicción Aplicable"
                  disabled={isSuggestingClause}
              />
          </div>

          <div className="space-y-2">
              <Label htmlFor="insertion-point">Posición de la nueva sección</Label>
              <Select value={insertAfterCellId} onValueChange={setInsertAfterCellId} disabled={isSuggestingClause}>
                  <SelectTrigger id="insertion-point">
                      <SelectValue placeholder="Seleccionar posición..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="start">Al principio del contrato</SelectItem>
                      {cells.filter(c => c.visible).map((cell) => (
                          <SelectItem key={cell.id} value={cell.id}>
                              Después de: {cell.title || "Sección sin título"}
                          </SelectItem>
                      ))}
                      <SelectItem value="end">Al final del contrato</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="suggestion-description">Descripción para la IA</Label>
              <Textarea
                  id="suggestion-description"
                  placeholder="Ej: 'Una cláusula que especifique que cualquier disputa se resolverá en los tribunales de la Ciudad de México.'"
                  value={clauseSuggestionDescription}
                  onChange={(e) => setClauseSuggestionDescription(e.target.value)}
                  rows={3}
                  disabled={isSuggestingClause}
              />
          </div>
          
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAddAndClose} disabled={!suggestedClauseText || !newClauseTitle.trim() || isSuggestingClause}>
            Añadir al Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
ClauseSuggesterDialog.displayName = 'ClauseSuggesterDialog';


function ContractEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const opportunityName = searchParams.get('opportunityName') || 'Oportunidad sin Nombre';
  const opportunityId = searchParams.get('opportunityId');

  const [cells, setCells] = useState<ContractCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRenumbering, setIsRenumbering] = useState(false);
  const [contractData, setContractData] = useState<Record<string, any> | null>(null);
  
  // State for delete confirmation
  const [cellToDeleteId, setCellToDeleteId] = useState<string | null>(null);

  // State to manage which cell is being rewritten to open the dialog
  const [rewritingCell, setRewritingCell] = useState<ContractCell | null>(null);
  
  // State to manage the clause suggester dialog
  const [isClauseSuggesterOpen, setIsClauseSuggesterOpen] = useState(false);

  // State for section manager
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);

  // State for conditional sections
  const [tipoAcreditado, setTipoAcreditado] = useState<'Persona Moral' | 'Persona Fisica'>('Persona Moral');

  const visibleCellIds = useMemo(() => cells.filter(c => c.visible).map(c => c.id), [cells]);

  const generateContractCells = useCallback((templateDataSource: Record<string, any>, accreditedType: string) => {
    const template = defaultTemplates[0]; // Always NDA
    const fullData = { ...templateDataSource, TIPO_ACREDITADO: accreditedType };
    const initialCells = template.generateCells(fullData).map(c => ({...c, visible: true}));
    setCells(initialCells);
  }, []);

  const loadContract = useCallback(async () => {
    if (!opportunityId) {
        setIsLoading(false);
        toast({ title: 'Error', description: 'No se proporcionó un ID de oportunidad.', variant: 'destructive' });
        generateContractCells({}, tipoAcreditado);
        return;
    }

    setIsLoading(true);

    let templateDataSource: Record<string, any> = {};

    try {
        const detailedResponse = await fetch('/api/opportunity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_portunidad: opportunityId }),
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
    
    setContractData(templateDataSource);


    let progressLoaded = false;
    try {
        const progressResponse = await fetch('/api/progress/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_oportunidad: opportunityId })
        });

        if (progressResponse.ok) {
            const result = await progressResponse.json();
            const savedData = Array.isArray(result) ? result[0] : result;
            
            if (savedData && savedData.avance_json && savedData.avance_json.cells && savedData.avance_json.cells.length > 0) {
                const loadedCells = savedData.avance_json.cells.map((c: ContractCell) => ({ ...c, visible: c.visible !== false }));
                setCells(loadedCells);
                setTipoAcreditado(savedData.avance_json.tipoAcreditado || 'Persona Moral');
                toast({ title: 'Progreso Cargado', description: 'Se ha restaurado tu último avance guardado.' });
                progressLoaded = true;
            }
        }
    } catch (error) {
        console.warn("No saved progress found or failed to load, proceeding to generate new contract.", error);
    }

    if (!progressLoaded) {
        generateContractCells(templateDataSource, tipoAcreditado);
        if (Object.keys(templateDataSource).length > 0) {
            toast({ title: 'Contrato Generado', description: `Se ha generado un nuevo contrato.` });
        } else {
             toast({ title: 'Plantilla Cargada', description: `Inicia un nuevo contrato.` });
        }
    }

    setIsLoading(false);
  }, [opportunityId, toast, generateContractCells, tipoAcreditado]);


  useEffect(() => {
    loadContract();
  }, [loadContract]);


  useEffect(() => {
    if (!isLoading && contractData) { // Only regenerate if initial data is loaded
      generateContractCells(contractData, tipoAcreditado);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoAcreditado, isLoading]);
  
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
    if (!opportunityId) {
      toast({ title: 'Error al Guardar', description: 'No hay un ID de contrato u oportunidad para guardar.', variant: 'destructive' });
      return;
    }
    
    setIsSaving(true);
    toast({ title: 'Guardando...', description: 'Tu progreso está siendo guardado.' });

    const payload = {
      id_oportunidad: opportunityId,
      avance_json: { cells, tipoAcreditado },
    };

    try {
      const response = await fetch('/api/progress/insert', {
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

  const handleOpenRewriteDialog = (cell: ContractCell) => {
    setRewritingCell(cell);
  };

  const handleCloseRewriteDialog = () => {
    setRewritingCell(null);
  };

  const handleAcceptRewrite = (newText: string) => {
    if (rewritingCell) {
      updateCellContent(rewritingCell.id, newText);
      handleCloseRewriteDialog();
      toast({ title: 'Sección Actualizada', description: 'La sección ha sido actualizada con la sugerencia de la IA.' });
    }
  };

  const handleAddSuggestedClause = (newCell: ContractCell, position: string) => {
    let newCells = [...cells];
    if (position === 'end') {
      newCells.push(newCell);
    } else if (position === 'start') {
      newCells.unshift(newCell);
    } else {
      const targetIndex = cells.findIndex(c => c.id === position);
      if (targetIndex !== -1) {
        newCells.splice(targetIndex + 1, 0, newCell);
      } else {
        newCells.push(newCell); // Fallback to end
      }
    }
    setCells(newCells);

    setIsClauseSuggesterOpen(false);
    toast({ title: 'Sección Añadida', description: 'La cláusula sugerida por la IA ha sido añadida al contrato.' });
  };

  const toggleCellVisibility = (id: string, checked: boolean) => {
    setCells(cells.map(cell =>
      cell.id === id ? { ...cell, visible: checked } : cell
    ));
  };

  if (isLoading && cells.length === 0) {
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
            {opportunityId && <p className="text-sm text-muted-foreground mt-1">ID de Oportunidad: {opportunityId}</p>}
          </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="contract-type-display" className="font-medium">Tipo de Contrato:</Label>
              <div id="contract-type-display" className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm sm:w-[300px]">
                <span>Acuerdo de Confidencialidad (NDA)</span>
              </div>
              <Label htmlFor="accredited-type-select" className="font-medium">Tipo de Acreditado:</Label>
              <Select value={tipoAcreditado} onValueChange={(value) => setTipoAcreditado(value as 'Persona Moral' | 'Persona Fisica')}>
                <SelectTrigger id="accredited-type-select" className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Persona Moral">Persona Moral</SelectItem>
                    <SelectItem value="Persona Fisica">Persona Fisica</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsClauseSuggesterOpen(true)} variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                Sugerir Cláusula
              </Button>
              <Button onClick={() => setIsSectionManagerOpen(true)} variant="outline">
                <ListTree className="mr-2 h-4 w-4" />
                Gestionar Secciones
              </Button>
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
                      <RichTextEditor
                          value={cell.content}
                          onChange={(newContent) => updateCellContent(cell.id, newContent)}
                          disabled={isRenumbering || isSaving}
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
      
      <ClauseSuggesterDialog
        open={isClauseSuggesterOpen}
        onOpenChange={setIsClauseSuggesterOpen}
        cells={cells}
        onAddClause={handleAddSuggestedClause}
        toast={toast}
      />

      <RewriteClauseDialog
        cell={rewritingCell}
        onClose={handleCloseRewriteDialog}
        onAccept={handleAcceptRewrite}
        toast={toast}
      />

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

    
