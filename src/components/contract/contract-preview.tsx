
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
      .map(cell => `<div>${cell.content}</div>`)
      .join('<br /><br />');
  }, [cells]);

  const handleExportPdf = async () => {
    if (!previewContentRef.current) {
      toast({
        title: 'Error de Exportación',
        description: 'No se pudo encontrar el contenido para exportar.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    toast({ title: 'Exportando PDF...', description: 'Por favor, espere.' });

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
      });

      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      let y = margin;

      // --- Header ---
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Covalto', margin, y);
      y += 30;
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 20;

      // --- Body ---
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');

      // Helper to process and render HTML content
      const renderHtml = (htmlString: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        // Replace strong tags with a special text marker for jsPDF
        tempDiv.querySelectorAll('strong').forEach(strong => {
          strong.textContent = `##BOLD_START##${strong.textContent}##BOLD_END##`;
        });
        // Handle tables by converting them to simple text
        tempDiv.querySelectorAll('table').forEach(table => {
            let tableText = "\n--- INICIO DE TABLA ---\n";
            const rows = Array.from(table.querySelectorAll('tr'));
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('th, td'));
                tableText += cells.map(cell => cell.textContent?.trim()).join(' | ') + '\n';
            });
            tableText += "--- FIN DE TABLA ---\n";
            table.outerHTML = tableText;
        });


        const lines = tempDiv.innerText.split('\n');

        lines.forEach(line => {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }

          const splitText = pdf.splitTextToSize(line, usableWidth);
          
          splitText.forEach((textLine: string) => {
              if (y > pageHeight - margin) {
                pdf.addPage();
                y = margin;
              }

              let currentX = margin;
              const parts = textLine.split(/(##BOLD_START##|##BOLD_END##)/g).filter(Boolean);

              parts.forEach(part => {
                  if (part === '##BOLD_START##') {
                      pdf.setFont('times', 'bold');
                  } else if (part === '##BOLD_END##') {
                      pdf.setFont('times', 'normal');
                  } else {
                      pdf.text(part, currentX, y);
                      currentX += pdf.getStringUnitWidth(part) * pdf.getFontSize();
                  }
              });
              y += 12; // Line height
          });
        });
      };
      
      renderHtml(finalContractHtml);

      pdf.save('contract-document.pdf');
      toast({ title: 'PDF Exportado', description: 'El contrato se ha descargado.' });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error al Exportar',
        description: 'Ocurrió un error inesperado al generar el PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>Vista Previa del Documento Final</CardTitle>
        <CardDescription>
          Esta es una vista previa del documento final.
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
