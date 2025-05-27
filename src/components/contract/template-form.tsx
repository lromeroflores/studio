'use client';

import type { Control } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContractTemplate } from './types';

interface TemplateFormProps {
  template: ContractTemplate;
  form: any; // React Hook Form's useForm return type
}

export function TemplateForm({ template, form }: TemplateFormProps) {
  return (
    <Form {...form}>
      <form className="space-y-6">
        {template.fields.map((field) => (
          <FormField
            key={field.id}
            control={form.control as Control<any>}
            name={field.id}
            render={({ field: rhfField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
                <FormControl>
                  {field.type === 'textarea' ? (
                    <Textarea placeholder={field.placeholder} {...rhfField} />
                  ) : (
                    <Input type={field.type} placeholder={field.placeholder} {...rhfField} />
                  )}
                </FormControl>
                {field.placeholder && <FormDescription>{/* Can add descriptions here if needed */}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </form>
    </Form>
  );
}
