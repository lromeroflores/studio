
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface EditableTableProps {
  htmlContent: string;
  onContentChange: (newHtml: string) => void;
  disabled?: boolean;
}

// Helper to strip tags for display in input
const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html; // Guard for server-side rendering
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// Helper to wrap value in style tags
const styleVar = (text: string | number | undefined | null) => {
    if (text === undefined || text === null || String(text).trim() === '') {
        return '';
    }
    return `<strong style="color: red;">${String(text)}</strong>`;
};

export function EditableTable({ htmlContent, onContentChange, disabled }: EditableTableProps) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  // Parse the incoming HTML to populate the form fields
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const cells = Array.from(doc.querySelectorAll('tbody td'));
    
    if (cells.length === 4) {
      setDescription(stripHtml(cells[0].innerHTML));
      setQuantity(stripHtml(cells[1].innerHTML));
      setUnitPrice(stripHtml(cells[2].innerHTML.replace('$', '')));
      setTotalPrice(stripHtml(cells[3].innerHTML.replace('$', '')));
    }
  }, [htmlContent]);

  // Reconstruct the HTML table whenever a value changes
  useEffect(() => {
    // Avoid running on initial mount before values are set
    if (!description && !quantity && !unitPrice && !totalPrice) {
      return;
    }
      
    const newHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;"><thead><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Descripción del Servicio/Artículo</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Cantidad</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Unitario</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Total</th></tr></thead><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(description)}</td><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(quantity)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(unitPrice)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(totalPrice)}</td></tr></tbody></table>`;
    
    // Check if the generated HTML is different from the original to avoid infinite loops
    if (newHtml !== htmlContent) {
      onContentChange(newHtml);
    }
  }, [description, quantity, unitPrice, totalPrice, onContentChange, htmlContent]);

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="desc-servicio">Descripción del Servicio/Artículo</Label>
          <Textarea
            id="desc-servicio"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={disabled}
            className="bg-background"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cantidad-servicio">Cantidad</Label>
            <Input
              id="cantidad-servicio"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={disabled}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precio-unitario-servicio">Precio Unitario ($)</Label>
            <Input
              id="precio-unitario-servicio"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              disabled={disabled}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precio-total-servicio">Precio Total ($)</Label>
            <Input
              id="precio-total-servicio"
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              disabled={disabled}
              className="bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
