
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContractCell } from '@/components/contract/types';
import jsPDF from 'jspdf';
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
      // Wrap each cell's content in a div to ensure it's a block element,
      // and join with a double line break for clear separation between sections.
      .map(cell => `<div>${cell.content}</div>`)
      .join('<br /><br />');
  }, [cells]);


  const handleExportPdf = async () => {
    if (!previewContentRef.current) {
      toast({ title: 'Error de Exportación', description: 'No se pudo encontrar el contenido para exportar.', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    toast({ title: 'Exportando PDF...', description: 'Por favor, espere mientras se genera el PDF.' });

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
      });

      // Create a clean, temporary container for export
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '0';
      exportContainer.style.width = '550px'; // Standard letter width minus margins
      exportContainer.style.padding = '20px';
      exportContainer.style.fontFamily = 'Times, serif';
      exportContainer.style.fontSize = '12pt';
      exportContainer.style.color = 'black';
      exportContainer.style.backgroundColor = 'white';
      
      // Add a simple text header instead of SVG
      const header = `<div style="margin-bottom: 2rem; font-size: 24px; font-weight: bold; color: #002642;">Covalto</div>`;
      
      exportContainer.innerHTML = header + finalContractHtml;
      
      // Remove any problematic styling from strong tags
      const strongTags = exportContainer.getElementsByTagName('strong');
      for (let i = 0; i < strongTags.length; i++) {
        strongTags[i].style.color = 'black';
        strongTags[i].style.fontWeight = 'bold';
      }

      document.body.appendChild(exportContainer);
      
      // Allow a brief moment for rendering before capture
      await new Promise(resolve => setTimeout(resolve, 100));

      await pdf.html(exportContainer, {
        callback: function (doc) {
          doc.save('contract-document.pdf');
          toast({ title: 'PDF Exportado', description: 'El contrato ha sido descargado exitosamente.' });
        },
        x: 30, // Left margin
        y: 30, // Top margin
        width: 552, // Printable area width
        windowWidth: 552,
        autoPaging: 'text',
      });
      
      document.body.removeChild(exportContainer);

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
         <div className="p-10 bg-white border rounded-md min-h-[500px] overflow-y-auto font-serif text-black" ref={previewContentRef}>
            <div data-logo-container style={{ marginBottom: '2rem' }}>
              <CovaltoLogo style={{ width: '150px' }} />
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
