
export interface Opportunity {
  id: string;
  clientName: string;// To link to the contract for editing
  contractType: string; // e.g., "NDA", "Service Agreement"
  opportunityStatus: 'Nuevo' | 'En Progreso' | 'Completado';
  contractStatus: 'Borrador' | 'En Revisión' | 'Firmado';
  lastUpdated: string; // ISO date string for display
  description: string; // A short description of the opportunity
}
