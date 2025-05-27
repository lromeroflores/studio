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
