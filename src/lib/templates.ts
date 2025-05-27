import type { ContractTemplate } from '@/components/contract/types';

export const defaultTemplates: ContractTemplate[] = [
  {
    id: 'nda-v1',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'A standard mutual non-disclosure agreement.',
    fields: [
      { id: 'partyOneName', label: 'Party One Name', type: 'text', placeholder: 'e.g., Acme Corp', required: true },
      { id: 'partyOneAddress', label: 'Party One Address', type: 'text', placeholder: 'e.g., 123 Main St, Anytown', required: true },
      { id: 'partyTwoName', label: 'Party Two Name', type: 'text', placeholder: 'e.g., Beta LLC', required: true },
      { id: 'partyTwoAddress', label: 'Party Two Address', type: 'text', placeholder: 'e.g., 456 Oak Ave, Otherville', required: true },
      { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { id: 'term', label: 'Term of Agreement (years)', type: 'number', defaultValue: '2', required: true },
      { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'e.g., Evaluation of potential business relationship', required: true },
    ],
    baseText: (formData) => `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of ${formData.effectiveDate || '[Effective Date]'} ("Effective Date") by and between:

Party One:
${formData.partyOneName || '[Party One Name]'}
${formData.partyOneAddress || '[Party One Address]'}

and

Party Two:
${formData.partyTwoName || '[Party Two Name]'}
${formData.partyTwoAddress || '[Party Two Address]'}

(each a "Party" and collectively the "Parties").

1. Purpose. The Parties wish to explore a potential business relationship related to ${formData.purpose || '[Purpose of Disclosure]'} (the "Purpose"). In connection with the Purpose, each Party may disclose certain confidential information to the other.

2. Confidential Information. "Confidential Information" means any information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party"), either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or which should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.

3. Obligations. The Receiving Party agrees:
   (a) to hold the Confidential Information in strict confidence and to take all reasonable precautions to protect such Confidential Information;
   (b) not to disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party;
   (c) not to use any Confidential Information for any purpose except the Purpose.

4. Term. This Agreement shall remain in effect for a period of ${formData.term || '[Term]'} years from the Effective Date.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

PARTY ONE:
By: _________________________
Name: ${formData.partyOneName || '[Party One Name]'}
Title: _________________________

PARTY TWO:
By: _________________________
Name: ${formData.partyTwoName || '[Party Two Name]'}
Title: _________________________
    `,
  },
];
