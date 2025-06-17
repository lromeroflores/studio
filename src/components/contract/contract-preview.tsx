
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
    // Remove all section comments after processing visibility
    processedText = processedText.replace(/<!-- SECTION_(START|END): .*? -->/gs, '');
    // Remove multiple empty newlines that might result from section removal
    processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n');
    return processedText.trim();
  }, []);

  const formatAdHocClausesText = useCallback((clauses: AdHocClause[]): string => {
    if (clauses.length === 0) return '';
    let adHocText = '\n\n<hr style="margin: 20px 0; border-top: 1px solid #ccc;">\n<h3 style="font-size: 1.1em; margin-bottom: 10px;">--- AD-HOC CLAUSES ---</h3>\n';
    clauses.forEach((clause, index) => {
      const clauseHtml = clause.text.replace(/\n/g, '<br>');
      adHocText += `<div style="margin-bottom: 10px;"><strong>${index + 1}.</strong> ${clauseHtml}</div>\n`;
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
    setEditedVersion(null); // Reset edited version when underlying data changes
  }, [baseText, adHocClauses, templateSections]);


  const handleEditText = () => {
    const div = document.createElement('div');
    div.innerHTML = currentTextToShow;
    setEditTextInEditor(div.textContent || div.innerText || "");
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    setEditedVersion(editTextInEditor.replace(/\n/g, '<br>'));
    setIsEditing(false);
    toast({ title: 'Changes Saved', description: 'Your edits to the contract have been saved.' });
  };

  const handleCancelEdits = () => {
    setIsEditing(false);
    toast({ title: 'Edits Canceled', description: 'Your changes have been discarded.', variant: 'default' });
  };

  const getTextForAction = () => {
    if (isEditing) return editTextInEditor;
    const div = document.createElement('div');
    div.innerHTML = currentTextToShow;
    return div.textContent || div.innerText || "";
  };

  const handlePrint = () => {
    const printableContent = currentTextToShow;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Contract Preview</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em;} th, td { border: 1px solid #ddd; padding: 8px; text-align: left;} th { background-color: #f2f2f2;} img {max-width: 200px; margin-bottom: 1em;} hr {margin: 1em 0; border-top: 1px solid #ccc;} h3 {margin-top: 1em; margin-bottom: 0.5em;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Contract Document</h1>');
      printWindow.document.write(printableContent);
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
    const plainTextToRenumber = getTextForAction();
    if (!plainTextToRenumber.trim()) {
      toast({ title: "Cannot Renumber", description: "Contract text is empty.", variant: "destructive" });
      return;
    }
    setIsRenumbering(true);
    try {
      const result: RenumberContractOutput = await renumberContract({ contractText: plainTextToRenumber });
      if (result && result.renumberedContractText) {
        const renumberedHtml = result.renumberedContractText.replace(/\n/g, '<br>');
        if (isEditing) {
          setEditTextInEditor(result.renumberedContractText); // Update editor with plain text
        }
        setEditedVersion(renumberedHtml); // Update preview with HTML formatted text
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
    <Card className="shadow-lg">
      <CardHeader className="px-6 pb-6 pt-6">
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>
          Review the generated contract.
          {isEditing
            ? "You are currently editing the contract text directly."
            : "You can edit the text below or use the form/clause tools."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
         <div className="p-4 bg-muted/20 border rounded-md min-h-[calc(300px+2rem)]">
          {isEditing ? (
            <Textarea
              value={editTextInEditor}
              onChange={(e) => setEditTextInEditor(e.target.value)}
              className="w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[300px]"
              placeholder="Start typing your contract..."
              rows={15}
              disabled={isRenumbering}
            />
          ) : (
            <div
              className="text-sm prose prose-sm max-w-none min-h-[300px] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentTextToShow }}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center px-6 pb-6 pt-4">
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

