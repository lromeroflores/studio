
'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause, TemplateSectionStatus } from './types';
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
  const router = useRouter();


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
    return calculateGeneratedText();
  }, [calculateGeneratedText]);


  const handleSave = () => {
    // In a real app, you would have logic here to persist the contract state.
    toast({ title: 'Contract Saved', description: 'Your changes have been saved.' });
    router.push('/opportunities');
  };
  
  const handleSaveProgress = () => {
    // This could have different logic, e.g., saving as a draft.
    toast({ title: 'Progress Saved', description: 'Your progress has been saved.' });
    router.push('/opportunities');
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

      let yCanvasPosPx = 0; // Current Y position on the source canvas (in pixels)
      let pageCount = 0;

      while (yCanvasPosPx < imgHeightPx) {
        pageCount++;
        if (pageCount > 1) {
          pdf.addPage();
        }

        // Calculate the height of the current slice from the original canvas (in pixels)
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
          canvas,
          0,
          yCanvasPosPx,
          imgWidthPx,
          sliceHeightPx,
          0,
          0,
          imgWidthPx,
          sliceHeightPx
        );
        
        const sliceImgDataUrl = sliceCanvas.toDataURL('image/png');
        const sliceDisplayHeightPt = sliceHeightPx * scaleFactor;

        pdf.addImage(
          sliceImgDataUrl,
          'PNG',
          marginPt,
          marginPt,
          contentBoxWidthPt,
          sliceDisplayHeightPt
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


  return (
    <Card className="shadow-lg">
      <CardHeader className="px-6 pb-6 pt-6">
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>
          Review the generated contract below.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
         <div className="p-4 bg-muted/20 border rounded-md min-h-[calc(300px+2rem)] overflow-hidden">
            <div
              ref={previewContentRef}
              className="text-sm prose prose-sm max-w-none min-h-[300px] whitespace-pre-wrap break-words" 
              dangerouslySetInnerHTML={{ __html: currentTextToShow }}
            />
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-start items-center px-6 pb-6 pt-4 border-t">
        <Button 
          onClick={handleSave} 
          className="w-full sm:w-auto" 
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button 
          onClick={handleExportPdf} 
          variant="outline"
          className="w-full sm:w-auto" 
        >
          <Download className="mr-2 h-4 w-4" /> Export as PDF
        </Button>
        <Button 
          onClick={handleSaveProgress} 
          variant="secondary" 
          className="w-full sm:w-auto" 
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar progreso
        </Button>
      </CardFooter>
    </Card>
  );
}
