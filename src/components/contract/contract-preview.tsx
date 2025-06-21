
'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContractCell } from '@/components/contract/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ContractPreviewProps {
  cells: ContractCell[];
  data: Record<string, any> | null;
}

export function ContractPreview({ cells, data }: ContractPreviewProps) {
  const { toast } = useToast();
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const finalContractHtml = useMemo(() => {
    // The styling is now pre-applied in the cell content from the template.
    // We just need to join the cells and handle newlines.
    return cells.map(cell => cell.content.replace(/\n/g, '<br />')).join('<br /><br />');
  }, [cells]);


  const handleExportPdf = async () => {
    const contentToExport = previewContentRef.current;
    if (!contentToExport) {
      toast({ title: "Export Error", description: "Preview content not found.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    toast({ title: "Exporting PDF...", description: "Please wait while the PDF is being generated." });
    
    try {
      const canvas = await html2canvas(contentToExport, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const margin = 72; // 1 inch
      const contentWidth = pdfPageWidth - margin * 2;
      
      const imgProps = pdf.getImageProperties(canvas);
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;
      
      let heightLeft = contentHeight;
      let position = margin;

      // Add header/logo on each page (optional)
      const addHeader = (pdfInstance: jsPDF) => {
         const logoUrl = "https://bancaenlinea.covalto.com/feb/common/styles/themes/images/covalto-login.png";
         // This is a simplified way to add a logo. For complex headers, more logic is needed.
         // Note: Due to CORS, this image might not render if the browser blocks it.
         // Using it via html2canvas is more reliable.
      };

      // Add content to first page
      // addHeader(pdf);
      pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfPageHeight - margin * 2);

      // Add new pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - contentHeight - margin;
        pdf.addPage();
        // addHeader(pdf);
        pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pdfPageHeight - margin);
      }

      pdf.save('contract-document.pdf');
      toast({ title: "PDF Exported", description: "Contract has been downloaded successfully." });

    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "PDF Export Failed", description: "Could not export PDF due to an unexpected error.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>Final Document Preview</CardTitle>
        <CardDescription>
          This is a preview of the final document. The variables from the original data are shown in bold and red.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
         <div className="p-10 bg-white border rounded-md min-h-[500px] overflow-y-auto font-serif text-black" ref={previewContentRef}>
            <img 
              src="https://bancaenlinea.covalto.com/feb/common/styles/themes/images/covalto-login.png" 
              alt="Covalto Logo"
              style={{ width: '150px', marginBottom: '2rem' }}
            />
            <div
              className="prose prose-sm max-w-none break-words" 
              dangerouslySetInnerHTML={{ __html: finalContractHtml }}
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center px-6 pb-6 pt-4 border-t">
        <Button 
          onClick={handleExportPdf} 
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </Button>
      </CardFooter>
    </Card>
  );
}
