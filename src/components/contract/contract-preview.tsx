
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download, Edit3, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause, TemplateSectionStatus } from './types';

interface ContractPreviewProps {
  baseText: string;
  adHocClauses: AdHocClause[];
  templateSections: TemplateSectionStatus[];
}

export function ContractPreview({ baseText, adHocClauses, templateSections }: ContractPreviewProps) {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTextInEditor, setEditTextInEditor] = useState<string>('');
  // State to hold the manually edited version. If null, generated text is used.
  const [editedVersion, setEditedVersion] = useState<string | null>(null);

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

  // Determine the text to display: edited version if available, otherwise generated.
  const currentTextToShow = useMemo(() => {
    if (editedVersion !== null) {
      return editedVersion;
    }
    return calculateGeneratedText();
  }, [editedVersion, calculateGeneratedText]);

  // If underlying contract props change, invalidate manual edits.
  useEffect(() => {
    setEditedVersion(null);
  }, [baseText, adHocClauses, templateSections]);


  const handleEditText = () => {
    setEditTextInEditor(currentTextToShow); // Initialize editor with what's currently shown
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    setEditedVersion(editTextInEditor); // Save manual edits
    setIsEditing(false);
    toast({ title: 'Changes Saved', description: 'Your edits to the contract have been saved.' });
  };

  const handleCancelEdits = () => {
    setIsEditing(false); // Simply exit edit mode; currentTextToShow will ensure correct display
    toast({ title: 'Edits Canceled', description: 'Your changes have been discarded.', variant: 'default' });
  };

  const getTextForAction = () => {
    // If editing, use the live text from editor, otherwise use the determined currentTextToShow
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

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>
          Review the generated contract.
          {isEditing
            ? "You are currently editing the contract text directly."
            : "You can edit the text below or use the form/clause tools."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/20">
          {isEditing ? (
            <Textarea
              value={editTextInEditor}
              onChange={(e) => setEditTextInEditor(e.target.value)}
              className="h-full w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              placeholder="Start typing your contract..."
              rows={15}
            />
          ) : (
            <pre className="text-sm whitespace-pre-wrap break-words">{currentTextToShow}</pre>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleExportPdf} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export as PDF (Mock)
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button onClick={handleSaveEdits} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Edits
              </Button>
              <Button onClick={handleCancelEdits} variant="destructive" className="w-full sm:w-auto">
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEditText} variant="secondary" className="w-full sm:w-auto">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Text
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
