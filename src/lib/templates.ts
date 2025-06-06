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
      // New fields for the table
      { id: 'serviceDescription', label: 'Service/Item Description', type: 'text', placeholder: 'e.g., Consulting Services', defaultValue: 'Initial Consultation' },
      { id: 'serviceQuantity', label: 'Quantity', type: 'number', placeholder: 'e.g., 10', defaultValue: '1' },
      { id: 'serviceUnitPrice', label: 'Unit Price ($)', type: 'number', placeholder: 'e.g., 100', defaultValue: '500' },
    ],
    baseText: (formData) => {
      const serviceTotal = (parseFloat(formData.serviceQuantity) || 0) * (parseFloat(formData.serviceUnitPrice) || 0);
      return `<div><img src="https://placehold.co/200x60.png?text=CompanyLogo" alt="Company Logo" style="margin-bottom: 20px;" data-ai-hint="company logo"></div>
<!-- SECTION_START: title_header -->
NON-DISCLOSURE AGREEMENT
<!-- SECTION_END: title_header -->

<!-- SECTION_START: agreement_intro -->
This Non-Disclosure Agreement (the "Agreement") is entered into as of ${formData.effectiveDate || '[Effective Date]'} ("Effective Date") by and between:
<!-- SECTION_END: agreement_intro -->

<!-- SECTION_START: party_one_details -->
Party One:
${formData.partyOneName || '[Party One Name]'}
${formData.partyOneAddress || '[Party One Address]'}
<!-- SECTION_END: party_one_details -->

<!-- SECTION_START: party_two_details -->
and

Party Two:
${formData.partyTwoName || '[Party Two Name]'}
${formData.partyTwoAddress || '[Party Two Address]'}
<!-- SECTION_END: party_two_details -->

<!-- SECTION_START: parties_collective_definition -->
(each a "Party" and collectively the "Parties").
<!-- SECTION_END: parties_collective_definition -->

<!-- SECTION_START: purpose_clause -->
1. Purpose. The Parties wish to explore a potential business relationship related to ${formData.purpose || '[Purpose of Disclosure]'} (the "Purpose"). In connection with the Purpose, each Party may disclose certain confidential information to the other.
<!-- SECTION_END: purpose_clause -->

<!-- SECTION_START: service_summary_table -->
2. Service Summary. The following services/items are contemplated under this relationship:
<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">
  <thead>
    <tr>
      <th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Description</th>
      <th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Quantity</th>
      <th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Unit Price</th>
      <th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Total Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px;">${formData.serviceDescription || '[Service/Item Description]'}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">${formData.serviceQuantity || '[Quantity]'}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">$${formData.serviceUnitPrice || '[Unit Price]'}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">$${serviceTotal.toFixed(2)}</td>
    </tr>
  </tbody>
</table>
<!-- SECTION_END: service_summary_table -->

<!-- SECTION_START: confidential_information_clause -->
3. Confidential Information. "Confidential Information" means any information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party"), either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or which should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure. This is further clarified by the details in clause 2.
<!-- SECTION_END: confidential_information_clause -->

<!-- SECTION_START: obligations_clause -->
4. Obligations. The Receiving Party agrees:
   (a) to hold the Confidential Information in strict confidence and to take all reasonable precautions to protect such Confidential Information, in accordance with the terms outlined in clause 1 regarding the Purpose;
   (b) not to disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party;
   (c) not to use any Confidential Information for any purpose except the Purpose.
<!-- SECTION_END: obligations_clause -->

<!-- SECTION_START: term_clause -->
5. Term. This Agreement shall remain in effect for a period of ${formData.term || '[Term]'} years from the Effective Date.
<!-- SECTION_END: term_clause -->

<!-- SECTION_START: witness_clause -->
IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

PARTY ONE:
By: _________________________
Name: ${formData.partyOneName || '[Party One Name]'}
Title: _________________________

PARTY TWO:
By: _________________________
Name: ${formData.partyTwoName || '[Party Two Name]'}
Title: _________________________
<!-- SECTION_END: witness_clause -->
    `},
  },
];
