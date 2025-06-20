
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
      // When saving, convert newlines in textarea to <br> for HTML display
      setEditedVersion(editTextInEditor.replace(/\n/g, '<br>'));
      setIsEditing(false);
      toast({ title: 'Edits Applied', description: 'Your direct edits have been applied to the preview.' });
    } else {
      // When entering edit mode, convert <br> from HTML preview to newlines for textarea
      const div = document.createElement('div');
      div.innerHTML = currentTextToShow; // currentTextToShow is HTML
      setEditTextInEditor(div.innerText || div.textContent || ""); // Get text content
      setIsEditing(true);
    }
  };

  const handleExportPdf = async () => {
    const contentToExport = previewContentRef.current;
    if (!contentToExport) {
      toast({ title: "Export Error", description: "Preview content not found.", variant: "destructive" });
      return;
    }

    toast({ title: "Exporting PDF...", description: "Please wait while the PDF is being generated." });
    
    try {
      const canvas = await html2canvas(contentToExport, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: contentToExport.scrollWidth, // Capture full width of content
        height: contentToExport.scrollHeight, // Capture full height of content
        windowWidth: contentToExport.scrollWidth,
        windowHeight: contentToExport.scrollHeight,
      });

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // PDF setup: Letter size, 1-inch margins
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt', // points
        format: 'letter', // 612pt x 792pt
      });

      const pdfPageWidthPt = pdf.internal.pageSize.getWidth();
      const pdfPageHeightPt = pdf.internal.pageSize.getHeight();
      const marginPt = 72; // 1 inch = 72 points

      const contentBoxWidthPt = pdfPageWidthPt - 2 * marginPt;
      const contentBoxHeightPt = pdfPageHeightPt - 2 * marginPt;

      // Calculate scaling factor to fit image width into contentBoxWidthPt
      const scaleFactor = contentBoxWidthPt / imgWidthPx;
      // const scaledTotalImgHeightPt = imgHeightPx * scaleFactor;

      let yCanvasPosPx = 0; // Current Y position on the source canvas (in pixels)
      let pageCount = 0;

      while (yCanvasPosPx < imgHeightPx) {
        pageCount++;
        if (pageCount > 1) {
          pdf.addPage();
        }

        // Calculate the height of the current slice from the original canvas (in pixels)
        // This slice, when scaled by scaleFactor, should fit into contentBoxHeightPt
        let sliceHeightPx = Math.min(
          imgHeightPx - yCanvasPosPx, // Remaining height on canvas
          contentBoxHeightPt / scaleFactor // Max height that fits on PDF page (converted to canvas pixels)
        );
        
        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidthPx;
        sliceCanvas.height = sliceHeightPx;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (!sliceCtx) {
          throw new Error("Failed to get 2D context for slice canvas");
        }
        
        // Draw the slice from the original canvas to the temporary slice canvas
        sliceCtx.drawImage(
          canvas,       // Source canvas
          0,            // Source X
          yCanvasPosPx, // Source Y
          imgWidthPx,   // Source Width
          sliceHeightPx,// Source Height
          0,            // Destination X on sliceCanvas
          0,            // Destination Y on sliceCanvas
          imgWidthPx,   // Destination Width on sliceCanvas
          sliceHeightPx // Destination Height on sliceCanvas
        );
        
        const sliceImgDataUrl = sliceCanvas.toDataURL('image/png');
        const sliceDisplayHeightPt = sliceHeightPx * scaleFactor; // Height of this slice on the PDF page

        pdf.addImage(
          sliceImgDataUrl,
          'PNG',
          marginPt,               // X position on PDF page (left margin)
          marginPt,               // Y position on PDF page (top margin)
          contentBoxWidthPt,      // Width of image on PDF page
          sliceDisplayHeightPt    // Height of image on PDF page
        );

        yCanvasPosPx += sliceHeightPx;
      }

      pdf.save('contract.pdf');
      toast({ title: "PDF Exported", description: `Contract exported as contract.pdf (${pageCount} pages).` });

    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "PDF Export Failed", description: `Could not export PDF. ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
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
         <div className="p-4 bg-muted/20 border rounded-md min-h-[calc(300px+2rem)] overflow-hidden">
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
              className="text-sm prose prose-sm max-w-none min-h-[300px] whitespace-pre-wrap break-words" 
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
          {isEditing ? "Save Edits" : "Edit Text"}
        </Button>
      </CardFooter>
    </Card>
  );
}
