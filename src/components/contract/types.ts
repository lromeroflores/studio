
export interface ContractField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface ContractCell {
  id: string;
  title?: string;
  content: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  fields: ContractField[];
  generateCells: (formData: Record<string, any>) => ContractCell[];
}

export interface AdHocClause {
  id: string;
  text: string;
}
