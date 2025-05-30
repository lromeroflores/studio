export interface ContractField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  fields: ContractField[];
  baseText: (formData: Record<string, any>) => string;
}

export interface AdHocClause {
  id: string;
  text: string;
}

export interface TemplateSectionStatus {
  id: string; // Matches section_id from template comments
  title: string; // User-friendly title for the section
  visible: boolean;
  originalContent: string; // To help with display or debugging
}
