'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AdHocClause, TemplateSectionStatus } from './types';

interface ContractPreviewProps {
  baseText: string; // This is the fully interpolated text from the template
  adHocClauses: AdHocClause[];
  templateSections: TemplateSectionStatus[];
}

export function ContractPreview({ baseText, adHocClauses, templateSections }: ContractPreviewProps) {
  const { toast } = useToast();

  const processTextWithSectionVisibility = (text: string, sections: TemplateSectionStatus[]): string => {
    let processedText = text;

    sections.forEach(section => {
      if (!section.visible) {
        // Regex to find the section including its comments and remove it
        // Match[1] is the section ID, Match[2] is the content
        const sectionRegex = new RegExp(`<!-- SECTION_START: ${section.id} -->(.*?)<!-- SECTION_END: ${section.id} -->`, 'gs');
        processedText = processedText.replace(sectionRegex, '');
      }
    });

    // Clean up any remaining section comments (e.g. if section was visible)
    processedText = processedText.replace(/<!-- SECTION_(START|END): .*? -->/gs, '');
    // Also remove multiple blank lines that might result from removed sections
    processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n'); 
    return processedText.trim();
  };


  const fullContractText = () => {
    let text = processTextWithSectionVisibility(baseText, templateSections);
    
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
    toast({
      title: 'PDF Export (Mock)',
      description: 'Contract PDF export initiated! (This is a placeholder functionality).',
    });
  };

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Contract Preview</CardTitle>
        <CardDescription>Review the generated contract below. Sections from the template are combined with any ad-hoc clauses you've added. Use "Manage Template Sections" to toggle predefined clauses.</CardDescription>
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
