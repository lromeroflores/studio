'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2, Eye, DatabaseZap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { TemplateForm } from '@/components/contract/template-form';
import { AIClauseGenerator } from '@/components/contract/ai-clause-generator';
import { ContractPreview } from '@/components/contract/contract-preview';
import type { ContractTemplate, AdHocClause, ContractField } from '@/components/contract/types';
import { defaultTemplates } from '@/lib/templates';
import { fetchContractDataFromBigQuery, type FetchContractDataOutput } from '@/ai/flows/fetch-contract-data-from-bigquery';

export default function ContractEditorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>(defaultTemplates[0]);
  const [adHocClauses, setAdHocClauses] = useState<AdHocClause[]>([]);
  const [contractPreviewText, setContractPreviewText] = useState<string>('');
  const { toast } = useToast();

  const [bigQueryRecordId, setBigQueryRecordId] = useState<string>('');
  const [isFetchingFromBigQuery, setIsFetchingFromBigQuery] = useState<boolean>(false);

  const validationSchema = useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    selectedTemplate.fields.forEach(field => {
      let zodType: z.ZodTypeAny;
      switch (field.type) {
        case 'text':
        case 'textarea':
          zodType = z.string();
          if (field.required) zodType = zodType.min(1, `${field.label} is required.`);
          else zodType = zodType.optional().nullable(); // Allow null from BQ
          break;
        case 'number':
          zodType = z.preprocess(
            (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
            field.required 
              ? z.number({invalid_type_error: `${field.label} must be a number.`}) 
              : z.number({invalid_type_error: `${field.label} must be a number.`}).optional().nullable()
          );
          break;
        case 'date':
          zodType = z.string(); 
          if (field.required) zodType = zodType.min(1, `${field.label} is required.`);
          else zodType = zodType.optional().nullable();
          break;
        default:
          zodType = z.any();
      }
      schemaFields[field.id] = zodType;
    });
    return z.object(schemaFields);
  }, [selectedTemplate]);

  const formMethods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: useMemo(() => {
      const defaultVals: Record<string, any> = {};
      selectedTemplate.fields.forEach(field => {
        defaultVals[field.id] = field.defaultValue || (field.type === 'number' ? undefined : '');
      });
      return defaultVals;
    }, [selectedTemplate]),
  });

  useEffect(() => {
    formMethods.reset(
      selectedTemplate.fields.reduce((acc, field) => {
        acc[field.id] = field.defaultValue || (field.type === 'number' ? undefined : '');
        return acc;
      }, {} as Record<string, any>)
    );
    setContractPreviewText(selectedTemplate.baseText(formMethods.getValues()));
  }, [selectedTemplate, formMethods]);


  const handleAddAdHocClause = (clause: AdHocClause) => {
    setAdHocClauses(prev => [...prev, clause]);
  };

  const handleRemoveAdHocClause = (clauseId: string) => {
    setAdHocClauses(prev => prev.filter(c => c.id !== clauseId));
    toast({ title: 'Clause Removed', description: 'The ad-hoc clause has been removed.' });
  };

  const handlePreviewContract = () => {
    const currentValues = formMethods.getValues();
    setContractPreviewText(selectedTemplate.baseText(currentValues));
    toast({ title: 'Preview Updated', description: 'Contract preview has been refreshed with the latest data.' });
  };
  
  useEffect(() => {
    const subscription = formMethods.watch((values) => {
      setContractPreviewText(selectedTemplate.baseText(values as Record<string, any>));
    });
    return () => subscription.unsubscribe();
  }, [formMethods, selectedTemplate]);

  const handleTemplateChange = (templateId: string) => {
    const newTemplate = defaultTemplates.find(t => t.id === templateId);
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
       // Reset form with new template defaults
      formMethods.reset(
        newTemplate.fields.reduce((acc, field) => {
          acc[field.id] = field.defaultValue || (field.type === 'number' ? undefined : '');
          return acc;
        }, {} as Record<string, any>)
      );
    }
  };

  const handleFetchFromBigQuery = async () => {
    if (!bigQueryRecordId.trim()) {
      toast({ title: 'Error', description: 'Please enter a Record ID to fetch from BigQuery.', variant: 'destructive' });
      return;
    }
    setIsFetchingFromBigQuery(true);
    try {
      const result: FetchContractDataOutput = await fetchContractDataFromBigQuery({ recordId: bigQueryRecordId });
      if (result) {
        // Populate form fields
        // Ensure selectedTemplate fields are iterated to avoid setting undefined fields on the form
        selectedTemplate.fields.forEach(field => {
          if (result.hasOwnProperty(field.id)) {
            let valueToSet = result[field.id as keyof FetchContractDataOutput];
            
            // Handle date formatting if necessary (BigQuery might return ISO string, HTML date input needs YYYY-MM-DD)
            if (field.type === 'date' && typeof valueToSet === 'string' && valueToSet) {
              try {
                valueToSet = new Date(valueToSet).toISOString().split('T')[0];
              } catch (e) {
                console.warn(`Could not parse date for field ${field.id}: ${valueToSet}`);
                valueToSet = ''; // or keep original, or set to null
              }
            }
            
            // For number fields, ensure it's a number or undefined for optional fields
            if (field.type === 'number') {
               valueToSet = valueToSet === null || valueToSet === undefined || valueToSet === '' ? undefined : Number(valueToSet);
            }

            formMethods.setValue(field.id as any, valueToSet ?? '');
          }
        });
        toast({ title: 'Data Fetched', description: 'Contract data has been pre-filled from BigQuery.' });
        handlePreviewContract(); // Refresh preview
      } else {
        toast({ title: 'Not Found', description: `No data found in BigQuery for Record ID: ${bigQueryRecordId}`, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error fetching from BigQuery:', error);
      toast({ title: 'BigQuery Fetch Failed', description: `Could not fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsFetchingFromBigQuery(false);
    }
  };


  return (
    <div className="container mx-auto py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Template and AI */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>Fill in the fields for your chosen contract template or fetch from BigQuery.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a contract template" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                 <div>
                  <Label htmlFor="bigquery-record-id">Fetch by Record ID (from BigQuery)</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="bigquery-record-id"
                      placeholder="Enter Record ID"
                      value={bigQueryRecordId}
                      onChange={(e) => setBigQueryRecordId(e.target.value)}
                      disabled={isFetchingFromBigQuery}
                    />
                    <Button onClick={handleFetchFromBigQuery} disabled={isFetchingFromBigQuery || !bigQueryRecordId.trim()} className="whitespace-nowrap">
                      {isFetchingFromBigQuery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
                      Fetch Data
                    </Button>
                  </div>
                </div>
                <Separator />
                <FormProvider {...formMethods}>
                  <TemplateForm template={selectedTemplate} form={formMethods} />
                </FormProvider>
              </div>
            </CardContent>
             <CardFooter>
                <Button onClick={handlePreviewContract} className="w-full" variant="outline">
                  <Eye className="mr-2 h-4 w-4" /> Refresh Preview
                </Button>
            </CardFooter>
          </Card>

          <AIClauseGenerator onAddClause={handleAddAdHocClause} />
          
          {adHocClauses.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Ad-Hoc Clauses</CardTitle>
                <CardDescription>Clauses added using the AI generator.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {adHocClauses.map((clause, index) => (
                  <div key={clause.id} className="flex justify-between items-start p-2 border rounded-md bg-muted/30">
                    <p className="text-sm flex-1 whitespace-pre-wrap break-words"><strong>{index+1}.</strong> {clause.text}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveAdHocClause(clause.id)} aria-label="Remove clause">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="md:col-span-2">
          <ContractPreview baseText={contractPreviewText} adHocClauses={adHocClauses} />
        </div>
      </div>
    </div>
  );
}
