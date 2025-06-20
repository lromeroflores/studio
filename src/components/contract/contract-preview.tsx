
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, Edit3, Save, Loader2, ListRestart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause, TemplateSectionStatus } from './types';
import { renumberContract, type RenumberContractOutput } from '@/ai/flows/renumber-contract-flow';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ContractPreviewProps {
  baseText: string;
  adHocClauses: AdHocClause[];
  templateSections: TemplateSectionStatus[];
}

export function ContractPreview({ baseText, adHocClauses, templateSections }: ContractPreviewProps) {
  const { toast } = useToast();
  const previewContentRef = useRef<HTMLDivElement>(null);

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
    setEditedVersion(null); 
  }, [baseText, adHocClauses, templateSections]);


  const getTextForAction = () => {
    if (isEditing) return editTextInEditor;
    const div = document.createElement('div');
    div.innerHTML = currentTextToShow;
    return div.textContent || div.innerText || "";
  };

  const handleToggleAndSaveEditing = () => {
    if (isEditing) {
      setEditedVersion(editTextInEditor.replace(/\n/g, '<br>'));
      setIsEditing(false);
      toast({ title: 'Edits Applied', description: 'Your direct edits have been applied to the preview.' });
    } else {
      const div = document.createElement('div');
      div.innerHTML = currentTextToShow;
      setEditTextInEditor(div.textContent || div.innerText || "");
      setIsEditing(true);
    }
  };

  const handleExportPdf = async () => {
    if (!previewContentRef.current) {
      toast({ title: "Export Error", description: "Preview content not found.", variant: "destructive" });
      return;
    }
    toast({ title: "Exporting PDF...", description: "Please wait while the PDF is being generated." });
    try {
      const canvas = await html2canvas(previewContentRef.current, {
        scale: 2, // Improve quality
        useCORS: true, // If images are from external sources
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('contract.pdf');
      toast({ title: "PDF Exported", description: "Contract has been exported as contract.pdf." });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "PDF Export Failed", description: "Could not export the contract as PDF.", variant: "destructive" });
    }
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
          setEditTextInEditor(result.renumberedContractText); 
        }
        setEditedVersion(renumberedHtml); 
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
              ref={previewContentRef}
              className="text-sm prose prose-sm max-w-none min-h-[300px] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: currentTextToShow }}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-start items-center px-6 pb-6 pt-4 border-t">
        <Button 
          onClick={handleRenumberContract} 
          variant="outline" 
          className="w-full sm:w-auto" 
          disabled={isRenumbering || isEditing}
        >
          {isRenumbering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListRestart className="mr-2 h-4 w-4" />}
          Renumber (AI)
        </Button>
        <Button 
          onClick={handleExportPdf} 
          className="w-full sm:w-auto" 
          disabled={isRenumbering || isEditing}
        >
          <Download className="mr-2 h-4 w-4" /> Export as PDF
        </Button>
        <Button 
          onClick={handleToggleAndSaveEditing} 
          variant="secondary" 
          className="w-full sm:w-auto" 
          disabled={isRenumbering}
        >
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
          Edit Text
        </Button>
      </CardFooter>
    </Card>
  );
}
