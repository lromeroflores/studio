
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
        ...formData,
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') {
            return '';
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
          content: `2. Resumen del Servicio\nLos siguientes servicios/artículos están contemplados bajo esta relación:`,
        },
        {
          title: 'Detalles del Servicio',
          content: `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: sans-serif;"><thead><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Descripción del Servicio/Artículo</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Cantidad</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Unitario</th><th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Precio Total</th></tr></thead><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(data.descripcion_servicio)}</td><td style="border: 1px solid #ccc; padding: 8px;">${styleVar(data.cantidad)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(data.precio_unitario)}</td><td style="border: 1px solid #ccc; padding: 8px;">$${styleVar(precio_total_display)}</td></tr></tbody></table>`,
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
  {
    id: 'servicios-v1',
    name: 'Contrato de Servicios',
    description: 'Un contrato estándar para la prestación de servicios profesionales.',
    fields: [
      // Reusing fields from NDA and adding new ones
      { id: 'nombre_parte_uno', label: 'Nombre del Cliente', type: 'text', required: true },
      { id: 'direccion_parte_uno', label: 'Dirección del Cliente', type: 'text', required: true },
      { id: 'nombre_parte_dos', label: 'Nombre del Proveedor de Servicios', type: 'text', required: true },
      { id: 'direccion_parte_dos', label: 'Dirección del Proveedor', type: 'text', required: true },
      { id: 'fecha_efectiva', label: 'Fecha de Entrada en Vigor', type: 'date', required: true },
      { id: 'descripcion_detallada_servicios', label: 'Descripción Detallada de los Servicios', type: 'textarea', placeholder: 'Especificar los servicios a ser prestados...' },
      { id: 'entregables', label: 'Entregables', type: 'textarea', placeholder: 'Listar los entregables del proyecto...' },
      { id: 'plazo_ejecucion', label: 'Plazo de Ejecución', type: 'text', placeholder: 'Ej: 30 días hábiles' },
      { id: 'precio_total', label: 'Honorarios Totales ($)', type: 'number' },
      { id: 'condiciones_pago', label: 'Condiciones de Pago', type: 'text', placeholder: 'Ej: 50% al inicio, 50% al finalizar' },
    ],
    generateCells: (formData): ContractCell[] => {
      const data = {
        nombre_parte_uno: '[Nombre del Cliente]',
        direccion_parte_uno: '[Dirección del Cliente]',
        nombre_parte_dos: '[Nombre del Proveedor]',
        direccion_parte_dos: '[Dirección del Proveedor]',
        fecha_efectiva: '[Fecha de Entrada en Vigor]',
        descripcion_detallada_servicios: '[Descripción detallada de los servicios a prestar]',
        entregables: '[Lista de entregables específicos]',
        plazo_ejecucion: '[Plazo para la ejecución de los servicios]',
        precio_total: '0',
        condiciones_pago: '[Condiciones de pago, ej. 50% de anticipo]',
        ...formData,
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') return '[Dato no proporcionado]';
        return `<strong style="color: red;">${String(text)}</strong>`;
      };
      
      const cells = [
        { title: 'Título', content: 'Contrato de Prestación de Servicios' },
        { title: 'Partes', content: `Este Contrato de Prestación de Servicios (el "Contrato") se celebra el ${styleVar(data.fecha_efectiva)}, entre ${styleVar(data.nombre_parte_uno)} ("Cliente"), con domicilio en ${styleVar(data.direccion_parte_uno)}, y ${styleVar(data.nombre_parte_dos)} ("Proveedor"), con domicilio en ${styleVar(data.direccion_parte_dos)}.` },
        { title: '1. Objeto del Contrato', content: `1.1. El Proveedor se compromete a prestar al Cliente los servicios profesionales que se describen a continuación: ${styleVar(data.descripcion_detallada_servicios)} (los "Servicios").` },
        { title: '2. Entregables', content: `2.1. Como parte de los Servicios, el Proveedor deberá entregar al Cliente los siguientes elementos: ${styleVar(data.entregables)}.` },
        { title: '3. Plazo de Ejecución', content: `3.1. Los Servicios y Entregables descritos en este Contrato se completarán en un plazo de ${styleVar(data.plazo_ejecucion)} a partir de la Fecha de Entrada en Vigor.` },
        { title: '4. Honorarios y Forma de Pago', content: `4.1. Como contraprestación por los Servicios, el Cliente pagará al Proveedor la cantidad total de $${styleVar(data.precio_total)} USD.\n4.2. La forma de pago será la siguiente: ${styleVar(data.condiciones_pago)}.` },
        { title: '5. Obligaciones del Cliente', content: '5.1. Proporcionar toda la información y recursos necesarios para la correcta ejecución de los Servicios.\n5.2. Realizar los pagos en las fechas y formas acordadas.' },
        { title: '6. Obligaciones del Proveedor', content: '6.1. Ejecutar los Servicios de manera profesional y competente.\n6.2. Cumplir con los plazos y entregar los Entregables acordados.' },
        { title: '7. Propiedad Intelectual', content: '7.1. Salvo que se acuerde lo contrario por escrito, todos los derechos de propiedad intelectual sobre los Entregables serán transferidos al Cliente una vez completado el pago final.' },
        { title: '8. Confidencialidad', content: '8.1. Ambas partes se comprometen a no divulgar la información confidencial de la otra parte obtenida en el marco de este Contrato a terceros.' },
        { title: '9. Vigencia y Terminación', content: '9.1. Este Contrato entrará en vigor en la Fecha de Entrada en Vigor y permanecerá vigente hasta la finalización de los Servicios, a menos que se termine anticipadamente de acuerdo con sus términos.' },
        { title: '10. Independencia de las Partes', content: '10.1. La relación entre el Cliente y el Proveedor es la de contratantes independientes. Este Contrato no crea una relación de empleador-empleado, sociedad o empresa conjunta.' },
        { title: '11. Ley Aplicable y Jurisdicción', content: '11.1. Este Contrato se regirá e interpretará de conformidad con las leyes de la Ciudad de México. Cualquier disputa será sometida a la jurisdicción exclusiva de los tribunales de dicha ciudad.' },
        { title: 'Firmas', content: `EN FE DE LO CUAL, las Partes han firmado este Acuerdo.\n\nCLIENTE:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_uno)}\n\nPROVEEDOR:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_dos)}` },
      ];
      
      return cells.map((cell, index) => ({ ...cell, id: `cell-svc-${index}` }));
    }
  },
  {
    id: 'saas-v1',
    name: 'Contrato SaaS',
    description: 'Un contrato estándar para un servicio de Software como Servicio (SaaS).',
    fields: [
      { id: 'nombre_parte_uno', label: 'Nombre del Cliente', type: 'text', required: true },
      { id: 'nombre_parte_dos', label: 'Nombre del Proveedor SaaS', type: 'text', required: true },
      { id: 'fecha_efectiva', label: 'Fecha de Entrada en Vigor', type: 'date', required: true },
      { id: 'nombre_software', label: 'Nombre del Software', type: 'text' },
      { id: 'nivel_servicio_sla', label: 'Acuerdo de Nivel de Servicio (SLA)', type: 'textarea', placeholder: 'Ej: 99.9% de uptime mensual...' },
      { id: 'usuarios_permitidos', label: 'Número de Usuarios Permitidos', type: 'number' },
      { id: 'politica_soporte', label: 'Política de Soporte', type: 'textarea', placeholder: 'Detalles del soporte técnico...' },
      { id: 'precio_total', label: 'Cuota de Suscripción ($)', type: 'number' },
      { id: 'frecuencia_pago', label: 'Frecuencia de Pago', type: 'text', placeholder: 'Mensual, Anual...' },
    ],
    generateCells: (formData): ContractCell[] => {
      const data = {
        nombre_parte_uno: '[Nombre del Cliente]',
        nombre_parte_dos: '[Nombre del Proveedor SaaS]',
        fecha_efectiva: '[Fecha de Entrada en Vigor]',
        nombre_software: '[Nombre del Software]',
        nivel_servicio_sla: '[Detalles del SLA, ej: 99.9% de uptime]',
        usuarios_permitidos: '[Número de usuarios]',
        politica_soporte: '[Detalles de la política de soporte]',
        precio_total: '0',
        frecuencia_pago: '[Frecuencia de pago, ej: Mensual]',
        ...formData,
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') return '[Dato no proporcionado]';
        return `<strong style="color: red;">${String(text)}</strong>`;
      };
      
      const cells = [
        { title: 'Título', content: 'Contrato de Servicios de Software (SaaS)' },
        { title: 'Partes', content: `Este Contrato se celebra el ${styleVar(data.fecha_efectiva)}, entre ${styleVar(data.nombre_parte_uno)} ("Cliente") y ${styleVar(data.nombre_parte_dos)} ("Proveedor").` },
        { title: '1. Definiciones', content: `1.1. "Servicio" se refiere al acceso al software basado en la web conocido como ${styleVar(data.nombre_software)}, alojado por el Proveedor.` },
        { title: '2. Otorgamiento de Licencia', content: `2.1. El Proveedor otorga al Cliente una licencia no exclusiva e intransferible para acceder y utilizar el Servicio para sus operaciones internas, para un máximo de ${styleVar(data.usuarios_permitidos)} usuarios.` },
        { title: '3. Servicios de Soporte', content: `3.1. El Proveedor proporcionará soporte técnico al Cliente según la siguiente política: ${styleVar(data.politica_soporte)}.` },
        { title: '4. Nivel de Servicio (SLA)', content: `4.1. El Proveedor se esforzará por mantener el Servicio disponible de acuerdo con el siguiente Acuerdo de Nivel de Servicio (SLA): ${styleVar(data.nivel_servicio_sla)}.` },
        { title: '5. Tarifas y Pago', content: `5.1. El Cliente pagará al Proveedor una cuota de suscripción de $${styleVar(data.precio_total)} con una frecuencia ${styleVar(data.frecuencia_pago)}.` },
        { title: '6. Propiedad Intelectual', content: '6.1. El Proveedor retiene todos los derechos, títulos e intereses sobre el Servicio y el software subyacente.' },
        { title: '7. Datos del Cliente', content: '7.1. El Cliente retiene todos los derechos sobre sus datos. El Proveedor utilizará los datos del Cliente únicamente para proporcionar y mejorar el Servicio.' },
        { title: '8. Confidencialidad', content: '8.1. Cada parte acuerda tratar la información de la otra como confidencial y no divulgarla a terceros.' },
        { title: '9. Vigencia y Terminación', content: `9.1. La vigencia inicial de este Contrato será de un año. Podrá ser terminado por cualquiera de las partes con un preaviso de 30 días.` },
        { title: '10. Limitación de Responsabilidad', content: '10.1. La responsabilidad total del Proveedor bajo este Contrato no excederá las tarifas pagadas por el Cliente durante los 12 meses anteriores al evento que dio lugar a la reclamación.' },
        { title: '11. Ley Aplicable', content: '11.1. Este Contrato se regirá por las leyes de la Ciudad de México.' },
        { title: 'Firmas', content: `EN FE DE LO CUAL, las Partes han firmado este Acuerdo.\n\nCLIENTE:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_uno)}\n\nPROVEEDOR:\nPor: _________________________\nNombre: ${styleVar(data.nombre_parte_dos)}` },
      ];

      return cells.map((cell, index) => ({ ...cell, id: `cell-saas-${index}` }));
    }
  },
];
