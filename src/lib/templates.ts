
import type { ContractTemplate, ContractCell } from '@/components/contract/types';

export const defaultTemplates: ContractTemplate[] = [
  {
    id: 'nda-v1',
    name: 'Acuerdo de Confidencialidad (NDA)',
    description: 'Un acuerdo de confidencialidad mutuo estándar.',
    fields: [
      { id: 'nombre_parte_uno', label: 'Nombre de la Primera Parte', type: 'text', placeholder: 'Ej: Acme Corp', required: true },
      { id: 'direccion_parte_uno', label: 'Dirección de la Primera Parte', type: 'text', placeholder: 'Ej: Av. Principal 123, Ciudad de México', required: true },
      { id: 'nombre_parte_dos', label: 'Nombre de la Segunda Parte', type: 'text', placeholder: 'Ej: Beta LLC', required: true },
      { id: 'direccion_parte_dos', label: 'Dirección de la Segunda Parte', type: 'text', placeholder: 'Ej: Calle Roble 456, Otra Ciudad', required: true },
      { id: 'fecha_efectiva', label: 'Fecha de Entrada en Vigor', type: 'date', required: true },
      { id: 'vigencia_en_anios', label: 'Vigencia del Acuerdo (años)', type: 'number', defaultValue: '2', required: true },
      { id: 'proposito_divulgacion', label: 'Propósito de la Divulgación', type: 'textarea', placeholder: 'Ej: Evaluación de una posible relación comercial', required: true },
      { id: 'descripcion_servicio', label: 'Descripción del Servicio/Artículo', type: 'text', placeholder: 'Ej: Servicios de Consultoría', defaultValue: 'Consulta Inicial' },
      { id: 'cantidad', label: 'Cantidad', type: 'number', placeholder: 'Ej: 10', defaultValue: '1' },
      { id: 'precio_unitario', label: 'Precio Unitario ($)', type: 'number', placeholder: 'Ej: 100', defaultValue: '500' },
    ],
    generateCells: (formData): ContractCell[] => {
      // If no data is provided, use placeholders
      const data = {
        nombre_parte_uno: '[Nombre de la Primera Parte]',
        direccion_parte_uno: '[Dirección de la Primera Parte]',
        nombre_parte_dos: '[Nombre de la Segunda Parte]',
        direccion_parte_dos: '[Dirección de la Segunda Parte]',
        fecha_efectiva: '[Fecha de Entrada en Vigor]',
        vigencia_en_anios: '[Vigencia]',
        proposito_divulgacion: '[Propósito de la Divulgación]',
        descripcion_servicio: '[Descripción del Servicio/Artículo]',
        cantidad: '1',
        precio_unitario: '0',
        precio_total: '0',
        ...formData, // fetched data will override placeholders
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') {
            return ''; // Return empty for null/undefined/empty values
        }
        return `<strong style="color: red;">${String(text)}</strong>`;
      };
      
      const precio_total_display = parseFloat(data.precio_total).toFixed(2);

      const cells = [
        {
          title: 'Título del Contrato',
          content: `Acuerdo de Confidencialidad`,
        },
        {
          title: 'Encabezado y Fecha',
          content: `Este Acuerdo de Confidencialidad (el "Acuerdo") se celebra con fecha de entrada en vigor el ${styleVar(data.fecha_efectiva)} ("Fecha de Entrada en Vigor") entre:`,
        },
        {
          title: 'Identificación de las Partes',
          content: `Primera Parte:\n${styleVar(data.nombre_parte_uno)}\n${styleVar(data.direccion_parte_uno)}\n\ny\n\nSegunda Parte:\n${styleVar(data.nombre_parte_dos)}\n${styleVar(data.direccion_parte_dos)}`,
        },
        {
          title: 'Definición Conjunta',
          content: `(cada una, una "Parte", y conjuntamente, las "Partes").`,
        },
        {
          title: 'Propósito',
          content: `1. Propósito\nLas Partes desean explorar una posible relación comercial relacionada con ${styleVar(data.proposito_divulgacion)} (el "Propósito"). En relación con dicho Propósito, cada Parte podrá divulgar cierta información confidencial a la otra.`,
        },
        {
          title: 'Resumen del Servicio',
          content: `2. Resumen del Servicio\nLos siguientes servicios/artículos están contemplados bajo esta relación:\n<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;"><thead><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Descripción del Servicio/Artículo</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Cantidad</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Unitario</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Total</th></tr></thead><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(data.descripcion_servicio)}</td><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(data.cantidad)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(data.precio_unitario)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(precio_total_display)}</td></tr></tbody></table>`,
        },
        {
          title: 'Información Confidencial',
          content: `3. Información Confidencial\n"Información Confidencial" se refiere a cualquier información divulgada por una Parte (la "Parte Reveladora") a la otra Parte (la "Parte Receptora"), ya sea directa o indirectamente, por escrito, verbalmente o mediante la inspección de objetos tangibles, que esté designada como "Confidencial", "Propietaria" o con alguna designación similar, o que razonablemente deba entenderse como confidencial dado el carácter de la información y las circunstancias de la divulgación.`,
        },
        {
          title: 'Obligaciones',
          content: `4. Obligaciones\nLa Parte Receptora se compromete:\n   (a) a mantener la Información Confidencial en estricta confidencialidad y a tomar todas las precauciones razonables para proteger dicha información;\n   (b) a no divulgar ninguna Información Confidencial a terceros sin el consentimiento previo por escrito de la Parte Reveladora;\n   (c) a no utilizar ninguna Información Confidencial para ningún propósito distinto al Propósito.`,
        },
        {
          title: 'Vigencia',
          content: `5. Vigencia\nEl presente Acuerdo permanecerá en vigor durante un período de ${styleVar(data.vigencia_en_anios)} años a partir de la Fecha de Entrada en Vigor.`,
        },
        {
          title: 'Firmas',
          content: `EN FE DE LO CUAL, las Partes han firmado este Acuerdo en la fecha indicada al inicio.\n\nPRIMERA PARTE:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_uno)}\nCargo: _________________________\n\nSEGUNDA PARTE:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_dos)}\nCargo: _________________________`,
        },
      ];

      return cells.map((cell, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        title: cell.title,
        content: cell.content.trim()
      }));
    }
  },
];
