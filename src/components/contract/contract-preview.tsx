
'use client';

import React, { useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContractCell } from '@/components/contract/types';
import jsPDF from 'jspdf';
import { CovaltoLogo } from '../icons/covalto-logo';

interface ContractPreviewProps {
  cells: ContractCell[];
  data: Record<string, any> | null;
}

export function ContractPreview({ cells, data }: ContractPreviewProps) {
  const { toast } = useToast();
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const finalContractHtml = useMemo(() => {
    return cells
      .filter(cell => cell.visible)
      // Wrap each cell's content in a div to allow prose styles to apply margins correctly
      .map(cell => `<div>${cell.content}</div>`)
      .join('');
  }, [cells]);


  const handleExportPdf = async () => {
    const contentToExport = previewContentRef.current;
    if (!contentToExport) {
      toast({ title: "Error de Exportación", description: "Contenido de la vista previa no encontrado.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    toast({ title: "Exportando PDF...", description: "Por favor, espere mientras se genera el PDF." });
    
    // Temporarily change variable color to black for a professional PDF look.
    const strongElements = Array.from(contentToExport.querySelectorAll('strong'));
    strongElements.forEach(el => {
      el.style.color = 'black';
    });

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
      });

      // Use jspdf.html() for better text rendering and automatic pagination
      await pdf.html(contentToExport, {
          margin: [72, 72, 72, 72], // 1 inch margins [top, right, bottom, left]
          autoPaging: 'text', // Automatically handle page breaks, avoiding cutting text
          width: 612 - 144, // Letter width (612pt) - 2 * margin
          windowWidth: contentToExport.scrollWidth,
      });

      pdf.save('contract-document.pdf');
      toast({ title: "PDF Exportado", description: "El contrato ha sido descargado exitosamente." });

    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "Error al Exportar PDF", description: "No se pudo exportar el PDF debido a un error inesperado.", variant: "destructive" });
    } finally {
      // Revert styles back to red for the on-screen preview
      strongElements.forEach(el => {
          el.style.color = ''; // Revert to stylesheet color
      });
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
         <div className="p-10 bg-white border rounded-md min-h-[500px] overflow-y-auto font-serif text-black" ref={previewContentRef}>
            <CovaltoLogo
              style={{ width: '150px', marginBottom: '2rem' }}
            />
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
