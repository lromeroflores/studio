'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Trash2, Eye, DatabaseZap, Loader2, ListCollapse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { TemplateForm } from '@/components/contract/template-form';
import { AIClauseGenerator } from '@/components/contract/ai-clause-generator';
import { ContractPreview } from '@/components/contract/contract-preview';
import type { ContractTemplate, AdHocClause, ContractField, TemplateSectionStatus } from '@/components/contract/types';
import { defaultTemplates } from '@/lib/templates';
import { fetchContractDataFromBigQuery, type FetchContractDataOutput } from '@/ai/flows/fetch-contract-data-from-bigquery';

// Helper function to create a user-friendly title from a section ID
const sectionIdToTitle = (id: string): string => {
  return id
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to parse sections from template text
const extractSectionsFromTemplate = (templateText: string): TemplateSectionStatus[] => {
  const sections: TemplateSectionStatus[] = [];
  const sectionRegex = /<!-- SECTION_START: (.*?) -->(.*?)<!-- SECTION_END: \1 -->/gs;
  let match;
  while ((match = sectionRegex.exec(templateText)) !== null) {
    const id = match[1];
    const content = match[2].trim();
    sections.push({
      id,
      title: sectionIdToTitle(id),
      originalContent: content, // Store original content for reference or stable ID generation
      visible: true,
    });
  }
  return sections;
};


export default function ContractEditorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>(defaultTemplates[0]);
  const [adHocClauses, setAdHocClauses] = useState<AdHocClause[]>([]);
  const [contractPreviewText, setContractPreviewText] = useState<string>('');
  const { toast } = useToast();

  const [bigQueryRecordId, setBigQueryRecordId] = useState<string>('');
  const [isFetchingFromBigQuery, setIsFetchingFromBigQuery] = useState<boolean>(false);

  const [templateSections, setTemplateSections] = useState<TemplateSectionStatus[]>([]);

  const validationSchema = useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    selectedTemplate.fields.forEach(field => {
      let zodType: z.ZodTypeAny;
      switch (field.type) {
        case 'text':
        case 'textarea':
          zodType = z.string();
          if (field.required) zodType = zodType.min(1, `${field.label} is required.`);
          else zodType = zodType.optional().nullable();
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

  const generateContractPreviewText = useCallback(() => {
    const currentValues = formMethods.getValues();
    return selectedTemplate.baseText(currentValues);
  }, [formMethods, selectedTemplate]);

  useEffect(() => {
    // Initialize/reset form and sections when template changes
    formMethods.reset(
      selectedTemplate.fields.reduce((acc, field) => {
        acc[field.id] = field.defaultValue || (field.type === 'number' ? undefined : '');
        return acc;
      }, {} as Record<string, any>)
    );
    
    const initialPreviewText = generateContractPreviewText();
    setContractPreviewText(initialPreviewText);

    // Parse sections from the raw template structure (not interpolated with data yet, for stable IDs)
    const rawTemplateText = selectedTemplate.baseText({}); // Use empty data for parsing structure
    const parsedSections = extractSectionsFromTemplate(rawTemplateText);
    setTemplateSections(parsedSections.map(s => ({ ...s, visible: true }))); // All visible by default

  }, [selectedTemplate, formMethods, generateContractPreviewText]);


  useEffect(() => {
    // Update preview text whenever form values change
    const subscription = formMethods.watch((values) => {
      setContractPreviewText(selectedTemplate.baseText(values as Record<string, any>));
    });
    return () => subscription.unsubscribe();
  }, [formMethods, selectedTemplate]);


  const handleAddAdHocClause = (clause: AdHocClause) => {
    setAdHocClauses(prev => [...prev, clause]);
  };

  const handleRemoveAdHocClause = (clauseId: string) => {
    setAdHocClauses(prev => prev.filter(c => c.id !== clauseId));
    toast({ title: 'Clause Removed', description: 'The ad-hoc clause has been removed.' });
  };

  const handlePreviewContract = () => {
    // This function is mostly for explicit refresh, actual preview updates via useEffect on form watch
    const currentValues = formMethods.getValues();
    setContractPreviewText(selectedTemplate.baseText(currentValues));
    toast({ title: 'Preview Updated', description: 'Contract preview has been refreshed with the latest data.' });
  };
  
  const handleTemplateChange = (templateId: string) => {
    const newTemplate = defaultTemplates.find(t => t.id === templateId);
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
      // Form reset and section parsing is handled by the useEffect watching selectedTemplate
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
        selectedTemplate.fields.forEach(field => {
          if (result.hasOwnProperty(field.id)) {
            let valueToSet = result[field.id as keyof FetchContractDataOutput];
            if (field.type === 'date' && typeof valueToSet === 'string' && valueToSet) {
              try {
                valueToSet = new Date(valueToSet).toISOString().split('T')[0];
              } catch (e) { console.warn(`Could not parse date for field ${field.id}: ${valueToSet}`); valueToSet = ''; }
            }
            if (field.type === 'number') {
               valueToSet = valueToSet === null || valueToSet === undefined || valueToSet === '' ? undefined : Number(valueToSet);
            }
            formMethods.setValue(field.id as any, valueToSet ?? '');
          }
        });
        toast({ title: 'Data Fetched', description: 'Contract data has been pre-filled from BigQuery.' });
        setContractPreviewText(generateContractPreviewText()); // Refresh preview with new data
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

  const handleToggleSectionVisibility = (sectionId: string) => {
    setTemplateSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      )
    );
  };


  return (
    <div className="container mx-auto py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Template, AI, Sections */}
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

          {templateSections.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListCollapse className="mr-2 h-6 w-6 text-accent" />
                  Manage Template Sections
                </CardTitle>
                <CardDescription>Toggle visibility of predefined sections in the contract.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templateSections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                    <Label htmlFor={`section-toggle-${section.id}`} className="flex-1 cursor-pointer text-sm">
                      {section.title}
                    </Label>
                    <Switch
                      id={`section-toggle-${section.id}`}
                      checked={section.visible}
                      onCheckedChange={() => handleToggleSectionVisibility(section.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
          <ContractPreview 
            baseText={contractPreviewText} 
            adHocClauses={adHocClauses}
            templateSections={templateSections} 
          />
        </div>
      </div>
    </div>
  );
}
