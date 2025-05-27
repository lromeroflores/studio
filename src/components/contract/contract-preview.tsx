'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause } from './types';

interface ContractPreviewProps {
  baseText: string;
  adHocClauses: AdHocClause[];
}

export function ContractPreview({ baseText, adHocClauses }: ContractPreviewProps) {
  const { toast } = useToast();

  const fullContractText = () => {
    let text = baseText;
    if (adHocClauses.length > 0) {
      text += '\n\n--- AD-HOC CLAUSES ---\n';
      adHocClauses.forEach((clause, index) => {
        text += `\n${index + 1}. ${clause.text}\n`;
      });
    }
    return text;
  };

  const handlePrint = () => {
    const printableContent = fullContractText();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Contract Preview</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word; padding: 20px; } h1 { font-size: 1.5em; margin-bottom: 1em; } p { margin-bottom: 0.5em; line-height: 1.6; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Contract Document</h1>');
      // Sanitize and format for printing
      const formattedText = printableContent
        .split('\n')
        .map(line => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "&nbsp;"}</p>`) // handle empty lines
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
    // This is a mocked PDF export. For real PDF export, a library like jsPDF or react-pdf would be needed.
    toast({
      title: 'PDF Export (Mock)',
      description: 'Contract PDF export initiated! (This is a placeholder functionality).',
    });
  };

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>Review the generated contract below. Sections from the template are combined with any ad-hoc clauses you've added.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/20">
          <pre className="text-sm whitespace-pre-wrap break-words">{fullContractText()}</pre>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button onClick={handleExportPdf} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Export as PDF (Mock)
        </Button>
      </CardFooter>
    </Card>
  );
}
