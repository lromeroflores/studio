
export interface Opportunity {
  id: string;
  clientName: string;
  contractId: string; // To link to the contract for editing
  contractType: string; // e.g., "NDA", "Service Agreement"
  opportunityStatus: 'New' | 'In Progress' | 'Pending Review' | 'Completed' | 'Closed';
  contractStatus: 'Draft' | 'Under Review' | 'Negotiation' | 'Signed' | 'Archived';
  lastUpdated: string; // ISO date string for display
  description: string; // A short description of the opportunity
}
