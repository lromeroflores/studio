
'use client';

import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const FONT_FAMILIES = [
  'Arial',
  'Verdana',
  'Times New Roman',
  'Georgia',
  'Courier New',
];
const FONT_SIZES = [
  { label: 'Pequeño', value: '2' }, // Corresponds to <font size="2">
  { label: 'Normal', value: '3' },
  { label: 'Grande', value: '5' },
  { label: 'Enorme', value: '7' },
];

export function RichTextEditor({
  value,
  onChange,
  disabled,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Synchronize the editor's content with the `value` prop from the parent.
  // This is carefully designed to avoid resetting the cursor position during edits.
  // It only updates the DOM if the `value` prop is different from the current
  // content of the editor, which happens on initial load or external changes (like re-numbering),
  // but not on re-renders caused by the user typing in this same editor.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      if (onChange && newHtml !== value) {
        onChange(newHtml);
      }
    }
  };

  const applyCommand = (command: string, valueArg?: string) => {
    if (disabled || !editorRef.current) return;
    document.execCommand(command, false, valueArg);
    editorRef.current.focus();
    handleContentChange(); // Update state after command
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('bold')}
          disabled={disabled}
          title="Negrita"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('italic')}
          disabled={disabled}
          title="Cursiva"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => applyCommand('underline')}
          disabled={disabled}
          title="Subrayado"
          type="button"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Select
          onValueChange={(val) => applyCommand('fontName', val)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => applyCommand('fontSize', val)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-1">
          <label htmlFor="color-picker" className="text-sm sr-only">
            Color de Texto
          </label>
          <Input
            id="color-picker"
            type="color"
            className="h-8 w-8 p-1 bg-card"
            onInput={(e) => applyCommand('foreColor', e.currentTarget.value)}
            disabled={disabled}
            title="Color de Texto"
            defaultValue="#000000"
          />
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onBlur={handleContentChange}
        suppressContentEditableWarning={true}
        // The dangerouslySetInnerHTML prop is removed to prevent React from
        // re-rendering the content on every keystroke, which caused the cursor jump.
        // The content is now managed by the useEffect hook.
        className={cn(
          'w-full min-h-[120px] p-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'prose prose-sm max-w-none',
          disabled ? 'cursor-not-allowed bg-muted/50' : 'bg-card'
        )}
        style={{
          whiteSpace: 'pre-wrap', // To preserve line breaks
          fontFamily: 'var(--font-geist-sans), sans-serif',
        }}
      />
    </div>
  );
}
