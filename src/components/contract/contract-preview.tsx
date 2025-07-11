
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContractCell } from '@/components/contract/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CovaltoLogo } from '@/components/icons/covalto-logo';

interface ContractPreviewProps {
  cells: ContractCell[];
  data: Record<string, any> | null;
}

export function ContractPreview({ cells, data }: ContractPreviewProps) {
  const { toast } = useToast();
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const finalContractHtml = useMemo(() => {
    return cells
      .filter(cell => cell.visible)
      .map(cell => `<div>${cell.content}</div>`)
      .join('<br /><br />');
  }, [cells]);


  const handleExportPdf = async () => {
    const elementToExport = previewContentRef.current;
    if (!elementToExport) {
      toast({ title: 'Error de Exportación', description: 'No se pudo encontrar el contenido para exportar.', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    toast({ title: 'Exportando PDF...', description: 'Por favor, espere mientras se genera el PDF.' });

    try {
      const canvas = await html2canvas(elementToExport, {
        scale: 2, // Improve resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'letter',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const imgHeight = canvasHeight / ratio;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('contract-document.pdf');
      toast({ title: 'PDF Exportado', description: 'El contrato ha sido descargado exitosamente.' });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast({ title: 'Error al Exportar PDF', description: `Detalle: ${errorMessage}`, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };
  

  return (
    <Card className="shadow-xl">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>Vista Previa del Documento Final</CardTitle>
        <CardDescription>
          Esta es una vista previa del documento final. Las variables de los datos originales se muestran en negrita y rojo.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
         <div id="pdf-preview-content" className="p-10 bg-white border rounded-md min-h-[500px] overflow-y-auto font-serif text-black" ref={previewContentRef}>
            <div data-logo-container style={{ marginBottom: '2rem' }}>
              <CovaltoLogo className="w-[150px]" />
            </div>
            <div
              className="prose max-w-none text-justify leading-relaxed prose-strong:text-red-600 prose-headings:font-bold" 
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
          {isExporting ? 'Exportando...' : 'Exportar como PDF'}
        </Button>
      </CardFooter>
    </Card>
  );
}
