
import type { ContractTemplate, ContractCell } from '@/components/contract/types';

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
      { id: 'serviceDescription', label: 'Service/Item Description', type: 'text', placeholder: 'e.g., Consulting Services', defaultValue: 'Initial Consultation' },
      { id: 'serviceQuantity', label: 'Quantity', type: 'number', placeholder: 'e.g., 10', defaultValue: '1' },
      { id: 'serviceUnitPrice', label: 'Unit Price ($)', type: 'number', placeholder: 'e.g., 100', defaultValue: '500' },
    ],
    generateCells: (formData): ContractCell[] => {
      // If no data is provided, use placeholders
      const data = {
        partyOneName: '[Party One Name]',
        partyOneAddress: '[Party One Address]',
        partyTwoName: '[Party Two Name]',
        partyTwoAddress: '[Party Two Address]',
        effectiveDate: '[Effective Date]',
        term: '[Term]',
        purpose: '[Purpose of Disclosure]',
        serviceDescription: '[Service/Item Description]',
        serviceQuantity: '1',
        serviceUnitPrice: '0',
        ...formData, // fetched data will override placeholders
      };

      const serviceTotal = (parseFloat(data.serviceQuantity) || 0) * (parseFloat(data.serviceUnitPrice) || 0);

      const cellsContent = [
        `NON-DISCLOSURE AGREEMENT`,
        `This Non-Disclosure Agreement (the "Agreement") is entered into as of ${data.effectiveDate} ("Effective Date") by and between:`,
        `Party One:\n${data.partyOneName}\n${data.partyOneAddress}`,
        `and\n\nParty Two:\n${data.partyTwoName}\n${data.partyTwoAddress}`,
        `(each a "Party" and collectively the "Parties").`,
        `1. Purpose. The Parties wish to explore a potential business relationship related to ${data.purpose} (the "Purpose"). In connection with the Purpose, each Party may disclose certain confidential information to the other.`,
        `2. Service Summary. The following services/items are contemplated under this relationship:\n<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;"><thead><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Description</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Quantity</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Unit Price</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Total Price</th></tr></thead><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">${data.serviceDescription}</td><td style="border: 1px solid #ccc; padding: 8px;">${data.serviceQuantity}</td><td style="border: 1px solid #ccc; padding: 8px;">$${data.serviceUnitPrice}</td><td style="border: 1px solid #ccc; padding: 8px;">$${serviceTotal.toFixed(2)}</td></tr></tbody></table>`,
        `3. Confidential Information. "Confidential Information" means any information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party"), either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or which should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.`,
        `4. Obligations. The Receiving Party agrees:\n   (a) to hold the Confidential Information in strict confidence and to take all reasonable precautions to protect such Confidential Information;\n   (b) not to disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party;\n   (c) not to use any Confidential Information for any purpose except the Purpose.`,
        `5. Term. This Agreement shall remain in effect for a period of ${data.term} years from the Effective Date.`,
        `IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n\nPARTY ONE:\nBy: _________________________\nName: ${data.partyOneName}\nTitle: _________________________\n\nPARTY TWO:\nBy: _________________________\nName: ${data.partyTwoName}\nTitle: _________________________`
      ];

      return cellsContent.map((content, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        content: content.trim()
      }));
    }
  },
];
