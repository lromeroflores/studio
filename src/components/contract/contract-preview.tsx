
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download, Edit3, Save, XCircle, Loader2, ListRestart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause, TemplateSectionStatus } from './types';
import { renumberContract, type RenumberContractOutput } from '@/ai/flows/renumber-contract-flow';

interface ContractPreviewProps {
  baseText: string;
  adHocClauses: AdHocClause[];
  templateSections: TemplateSectionStatus[];
}

export function ContractPreview({ baseText, adHocClauses, templateSections }: ContractPreviewProps) {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTextInEditor, setEditTextInEditor] = useState<string>('');
  const [editedVersion, setEditedVersion] = useState<string | null>(null);
  const [isRenumbering, setIsRenumbering] = useState<boolean>(false);


  const processTextWithSectionVisibility = useCallback((text: string, sections: TemplateSectionStatus[]): string => {
    let processedText = text;
    sections.forEach(section => {
      if (!section.visible) {
        const sectionRegex = new RegExp(`<!-- SECTION_START: ${section.id} -->(.*?)<!-- SECTION_END: ${section.id} -->`, 'gs');
        processedText = processedText.replace(sectionRegex, '');
      }
    });
    processedText = processedText.replace(/<!-- SECTION_(START|END): .*? -->/gs, '');
    processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n');
    return processedText.trim();
  }, []);

  const formatAdHocClausesText = useCallback((clauses: AdHocClause[]): string => {
    if (clauses.length === 0) return '';
    let adHocText = '\n\n--- AD-HOC CLAUSES ---\n';
    clauses.forEach((clause, index) => {
      adHocText += `\n${index + 1}. ${clause.text}\n`;
    });
    return adHocText;
  }, []);

  const calculateGeneratedText = useCallback(() => {
    const processedBase = processTextWithSectionVisibility(baseText, templateSections);
    const adHocText = formatAdHocClausesText(adHocClauses);
    return processedBase + adHocText;
  }, [baseText, templateSections, adHocClauses, processTextWithSectionVisibility, formatAdHocClausesText]);

  const currentTextToShow = useMemo(() => {
    if (editedVersion !== null) {
      return editedVersion;
    }
    return calculateGeneratedText();
  }, [editedVersion, calculateGeneratedText]);

  useEffect(() => {
    setEditedVersion(null); // Invalidate manual edits if underlying props change
  }, [baseText, adHocClauses, templateSections]);


  const handleEditText = () => {
    setEditTextInEditor(currentTextToShow);
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    setEditedVersion(editTextInEditor);
    setIsEditing(false);
    toast({ title: 'Changes Saved', description: 'Your edits to the contract have been saved.' });
  };

  const handleCancelEdits = () => {
    setIsEditing(false);
    toast({ title: 'Edits Canceled', description: 'Your changes have been discarded.', variant: 'default' });
  };

  const getTextForAction = () => {
    return isEditing ? editTextInEditor : currentTextToShow;
  };

  const handlePrint = () => {
    const printableContent = getTextForAction();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Contract Preview</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word; padding: 20px; } h1 { font-size: 1.5em; margin-bottom: 1em; } p { margin-bottom: 0.5em; line-height: 1.6; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Contract Document</h1>');
      const formattedText = printableContent
        .split('\n')
        .map(line => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "&nbsp;"}</p>`)
        .join('');
      printWindow.document.write(formattedText);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    } else {
      toast({ title: "Print Error", description: "Could not open print window. Please check your browser's pop-up settings.", variant: "destructive" });
    }
  };

  const handleExportPdf = () => {
    const textToExport = getTextForAction();
    console.log("Text to export for PDF:", textToExport);
    toast({
      title: 'PDF Export (Mock)',
      description: 'Contract PDF export initiated! (This is a placeholder functionality).',
    });
  };

  const handleRenumberContract = async () => {
    const textToRenumber = getTextForAction();
    if (!textToRenumber.trim()) {
      toast({ title: "Cannot Renumber", description: "Contract text is empty.", variant: "destructive" });
      return;
    }
    setIsRenumbering(true);
    try {
      const result: RenumberContractOutput = await renumberContract({ contractText: textToRenumber });
      if (result && result.renumberedContractText) {
        if (isEditing) {
          setEditTextInEditor(result.renumberedContractText);
        }
        setEditedVersion(result.renumberedContractText); // Set as the new authoritative version
        toast({ title: "Contract Re-numbered", description: "Clauses and references have been updated by AI." });
      } else {
        throw new Error("AI did not return renumbered text.");
      }
    } catch (error) {
      console.error('Error re-numbering contract:', error);
      toast({
        title: 'AI Re-numbering Failed',
        description: `Could not process the contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsRenumbering(false);
    }
  };


  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>
          Review the generated contract.
          {isEditing
            ? "You are currently editing the contract text directly."
            : "You can edit the text below or use the form/clause tools."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 bg-muted/20 border rounded-md">
        {isEditing ? (
          <Textarea
            value={editTextInEditor}
            onChange={(e) => setEditTextInEditor(e.target.value)}
            className="h-full w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[300px]"
            placeholder="Start typing your contract..."
            rows={15} 
            disabled={isRenumbering}
          />
        ) : (
          <pre className="text-sm whitespace-pre-wrap break-words h-full w-full">{currentTextToShow}</pre>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto" disabled={isRenumbering}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleExportPdf} className="w-full sm:w-auto" disabled={isRenumbering}>
            <Download className="mr-2 h-4 w-4" /> Export as PDF (Mock)
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
           <Button onClick={handleRenumberContract} variant="outline" className="w-full sm:w-auto" disabled={isRenumbering}>
            {isRenumbering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListRestart className="mr-2 h-4 w-4" />}
            Renumber (AI)
          </Button>
          {isEditing ? (
            <>
              <Button onClick={handleSaveEdits} className="w-full sm:w-auto" disabled={isRenumbering}>
                <Save className="mr-2 h-4 w-4" /> Save Edits
              </Button>
              <Button onClick={handleCancelEdits} variant="destructive" className="w-full sm:w-auto" disabled={isRenumbering}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEditText} variant="secondary" className="w-full sm:w-auto" disabled={isRenumbering}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Text
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

    