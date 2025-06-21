
import type { ContractTemplate, ContractCell } from '@/components/contract/types';

export const defaultTemplates: ContractTemplate[] = [
  {
    id: 'nda-v1',
    name: 'Acuerdo de Confidencialidad (NDA)',
    description: 'Un acuerdo de confidencialidad mutuo estándar.',
    fields: [
      { id: 'partyOneName', label: 'Nombre de la Primera Parte', type: 'text', placeholder: 'Ej: Acme Corp', required: true },
      { id: 'partyOneAddress', label: 'Dirección de la Primera Parte', type: 'text', placeholder: 'Ej: Av. Principal 123, Ciudad de México', required: true },
      { id: 'partyTwoName', label: 'Nombre de la Segunda Parte', type: 'text', placeholder: 'Ej: Beta LLC', required: true },
      { id: 'partyTwoAddress', label: 'Dirección de la Segunda Parte', type: 'text', placeholder: 'Ej: Calle Roble 456, Otra Ciudad', required: true },
      { id: 'effectiveDate', label: 'Fecha de Entrada en Vigor', type: 'date', required: true },
      { id: 'term', label: 'Vigencia del Acuerdo (años)', type: 'number', defaultValue: '2', required: true },
      { id: 'purpose', label: 'Propósito de la Divulgación', type: 'textarea', placeholder: 'Ej: Evaluación de una posible relación comercial', required: true },
      { id: 'serviceDescription', label: 'Descripción del Servicio/Artículo', type: 'text', placeholder: 'Ej: Servicios de Consultoría', defaultValue: 'Consulta Inicial' },
      { id: 'serviceQuantity', label: 'Cantidad', type: 'number', placeholder: 'Ej: 10', defaultValue: '1' },
      { id: 'serviceUnitPrice', label: 'Precio Unitario ($)', type: 'number', placeholder: 'Ej: 100', defaultValue: '500' },
    ],
    generateCells: (formData): ContractCell[] => {
      // If no data is provided, use placeholders
      const data = {
        partyOneName: '[Nombre de la Primera Parte]',
        partyOneAddress: '[Dirección de la Primera Parte]',
        partyTwoName: '[Nombre de la Segunda Parte]',
        partyTwoAddress: '[Dirección de la Segunda Parte]',
        effectiveDate: '[Fecha de Entrada en Vigor]',
        term: '[Vigencia]',
        purpose: '[Propósito de la Divulgación]',
        serviceDescription: '[Descripción del Servicio/Artículo]',
        serviceQuantity: '1',
        serviceUnitPrice: '0',
        ...formData, // fetched data will override placeholders
      };

      const serviceTotal = (parseFloat(data.serviceQuantity) || 0) * (parseFloat(data.serviceUnitPrice) || 0);

      const cellsContent = [
        `Acuerdo de Confidencialidad`,
        `Este Acuerdo de Confidencialidad (el "Acuerdo") se celebra con fecha de entrada en vigor el ${data.effectiveDate} ("Fecha de Entrada en Vigor") entre:`,
        `Primera Parte:\n${data.partyOneName}\n${data.partyOneAddress}`,
        `y\n\nSegunda Parte:\n${data.partyTwoName}\n${data.partyTwoAddress}`,
        `(cada una, una "Parte", y conjuntamente, las "Partes").`,
        `1. Propósito\nLas Partes desean explorar una posible relación comercial relacionada con ${data.purpose} (el "Propósito"). En relación con dicho Propósito, cada Parte podrá divulgar cierta información confidencial a la otra.`,
        `2. Resumen del Servicio\nLos siguientes servicios/artículos están contemplados bajo esta relación:\n<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;"><thead><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Descripción del Servicio/Artículo</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Cantidad</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Unitario</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Total</th></tr></thead><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">${data.serviceDescription}</td><td style="border: 1px solid #ccc; padding: 8px;">${data.serviceQuantity}</td><td style="border: 1px solid #ccc; padding: 8px;">$${data.serviceUnitPrice}</td><td style="border: 1px solid #ccc; padding: 8px;">$${serviceTotal.toFixed(2)}</td></tr></tbody></table>`,
        `3. Información Confidencial\n"Información Confidencial" se refiere a cualquier información divulgada por una Parte (la "Parte Reveladora") a la otra Parte (la "Parte Receptora"), ya sea directa o indirectamente, por escrito, verbalmente o mediante la inspección de objetos tangibles, que esté designada como "Confidencial", "Propietaria" o con alguna designación similar, o que razonablemente deba entenderse como confidencial dado el carácter de la información y las circunstancias de la divulgación.`,
        `4. Obligaciones\nLa Parte Receptora se compromete:\n   (a) a mantener la Información Confidencial en estricta confidencialidad y a tomar todas las precauciones razonables para proteger dicha información;\n   (b) a no divulgar ninguna Información Confidencial a terceros sin el consentimiento previo por escrito de la Parte Reveladora;\n   (c) a no utilizar ninguna Información Confidencial para ningún propósito distinto al Propósito.`,
        `5. Vigencia\nEl presente Acuerdo permanecerá en vigor durante un período de ${data.term} años a partir de la Fecha de Entrada en Vigor.`,
        `EN FE DE LO CUAL, las Partes han firmado este Acuerdo en la fecha indicada al inicio.\n\nPRIMERA PARTE:\nPor: _________________________\nNombre: ${data.partyOneName}\nCargo: _________________________\n\nSEGUNDA PARTE:\nPor: _________________________\nNombre: ${data.partyTwoName}\nCargo: _________________________`
      ];

      return cellsContent.map((content, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        content: content.trim()
      }));
    }
  },
];
