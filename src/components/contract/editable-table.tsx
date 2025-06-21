
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EditableTableProps {
  htmlContent: string;
  onContentChange: (newHtml: string) => void;
  disabled?: boolean;
}

// Helper to get text content from an HTML string
const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// Helper to wrap value in style tags for the final HTML
const styleVar = (text: string | number | undefined | null) => {
    if (text === undefined || text === null || String(text).trim() === '') {
        return '';
    }
    return `<strong style="color: red;">${String(text)}</strong>`;
};

export function EditableTable({ htmlContent, onContentChange, disabled }: EditableTableProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  
  const isInitialized = useMemo(() => headers.length > 0 || rows.length > 0, [headers, rows]);


  // 1. Parse incoming HTML to populate the table state
  useEffect(() => {
    if (!htmlContent) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const parsedHeaders = Array.from(doc.querySelectorAll('thead th')).map(th => th.textContent || '');
    const parsedRows = Array.from(doc.querySelectorAll('tbody tr')).map(tr => 
      Array.from(tr.querySelectorAll('td')).map(td => stripHtml(td.innerHTML))
    );
    
    // Only update state if parsed content is different to avoid loops
    if (JSON.stringify(parsedHeaders) !== JSON.stringify(headers)) {
        setHeaders(parsedHeaders);
    }
    if (JSON.stringify(parsedRows) !== JSON.stringify(rows)) {
        setRows(parsedRows);
    }
  }, [htmlContent]);

  // 2. Reconstruct HTML table when state changes and notify parent
  useEffect(() => {
    if (!isInitialized) return;

    const headerHtml = `<thead><tr>${headers
      .map(h => `<th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">${h}</th>`)
      .join('')}</tr></thead>`;
      
    const bodyHtml = `<tbody>${rows
      .map(row => `<tr>${row
        .map(cell => `<td style="border: 1px solid #ccc; padding: 8px;">${styleVar(cell)}</td>`)
        .join('')}</tr>`
      ).join('')}</tbody>`;

    const newHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;">${headerHtml}${bodyHtml}</table>`;

    onContentChange(newHtml);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, rows]);

  // --- Handler Functions ---
  const handleHeaderChange = (colIndex: number, value: string) => {
    setHeaders(currentHeaders => {
        const newHeaders = [...currentHeaders];
        newHeaders[colIndex] = value;
        return newHeaders;
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setRows(currentRows => {
      const newRows = JSON.parse(JSON.stringify(currentRows)); // Deep copy
      newRows[rowIndex][colIndex] = value;
      return newRows;
    });
  };

  const addRow = () => {
    const newRow = Array(headers.length).fill('');
    setRows(currentRows => [...currentRows, newRow]);
  };

  const removeRow = (rowIndex: number) => {
    setRows(currentRows => currentRows.filter((_, index) => index !== rowIndex));
  };

  const addColumn = () => {
    setHeaders(currentHeaders => [...currentHeaders, 'Nueva Columna']);
    setRows(currentRows => currentRows.map(row => [...row, '']));
  };

  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return; // Prevent removing the last column
    setHeaders(currentHeaders => currentHeaders.filter((_, index) => index !== colIndex));
    setRows(currentRows => currentRows.map(row => row.filter((_, index) => index !== colIndex)));
  };

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardHeader className="py-4 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Tabla Editable</CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={addRow} disabled={disabled} variant="outline" className="bg-background h-8">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Fila
          </Button>
          <Button size="sm" onClick={addColumn} disabled={disabled} variant="outline" className="bg-background h-8">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Columna
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-0 text-left align-top">
                    <div className="flex items-center gap-1">
                      <Input
                        value={header}
                        onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                        className="bg-background font-semibold"
                        disabled={disabled}
                        placeholder={`Encabezado ${colIndex + 1}`}
                      />
                       <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeColumn(colIndex)} disabled={disabled || headers.length <= 1} title="Eliminar Columna">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-0 align-top">
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="bg-background"
                        disabled={disabled}
                        placeholder="..."
                      />
                    </td>
                  ))}
                  <td className="p-0 align-top text-right">
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeRow(rowIndex)} disabled={disabled} title="Eliminar Fila">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
