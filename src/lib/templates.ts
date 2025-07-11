
import type { ContractTemplate, ContractCell } from '@/components/contract/types';

export const defaultTemplates: ContractTemplate[] = [
  {
    id: 'credito-v1',
    name: 'Contrato de Apertura de Crédito',
    description: 'Un contrato de apertura de crédito con obligación solidaria.',
    fields: [
      { id: 'DIA_FIRMA', label: 'Día de Firma', type: 'text', placeholder: 'Ej: 01', required: true },
      { id: 'MES_FIRMA', label: 'Mes de Firma', type: 'text', placeholder: 'Ej: Enero', required: true },
      { id: 'AÑO_FIRMA', label: 'Año de Firma', type: 'text', placeholder: 'Ej: 2024', required: true },
      { id: 'NOMBRE_DE_LA_ACREDITADA', label: 'Nombre del Acreditado', type: 'text', required: true },
      { id: 'NOMBRE_OBLIGADOS_SOLIDARIOS', label: 'Nombre(s) de Obligado(s) Solidario(s)', type: 'textarea', required: true },
      { id: 'APODERADO_COVALTO', label: 'Apoderado Legal de Covalto', type: 'text', required: true },
    ],
    generateCells: (formData): ContractCell[] => {
      const data = {
        DIA_FIRMA: '[DIA_FIRMA]',
        MES_FIRMA: '[MES_FIRMA]',
        AÑO_FIRMA: '[AÑO_FIRMA]',
        NOMBRE_DE_LA_ACREDITADA: '[NOMBRE DE LA ACREDITADA]',
        NOMBRE_OBLIGADOS_SOLIDARIOS: '[NOMBRE OBLIGADOS SOLIDARIOS]',
        APODERADO_COVALTO: '[APODERADO COVALTO]',
        ...formData,
      };

      const styleVar = (text: string | number | undefined | null) => {
        if (text === undefined || text === null || String(text).trim() === '') {
            return '';
        }
        return `<strong style="color: red;">${String(text)}</strong>`;
      };

      const cells = [
        {
          title: 'Titulo y descripcion',
          content: `<div class="text-center">CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA\n\nde fecha ${styleVar(data.DIA_FIRMA)} de ${styleVar(data.MES_FIRMA)} de ${styleVar(data.AÑO_FIRMA)}\n\nque celebran\n\n\n${styleVar(data.NOMBRE_DE_LA_ACREDITADA)}\n\ncomo Acreditado \n\n\nBANCO COVALTO, S.A. INSTITUCIÓN DE BANCA MÚLTIPLE\n\ncomo Acreditante y\n\n\n${styleVar(data.NOMBRE_OBLIGADOS_SOLIDARIOS)}\n\ncomo Obligados Solidarios</div>`,
        },
        {
          title: 'Inicio',
          content: `EL CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA (el “Contrato de Crédito”) que celebran por una parte BANCO COVALTO, SOCIEDAD ANÓNIMA INSTITUCIÓN DE BANCA MÚLTIPLE, representada por su apoderado legal, el señor ${styleVar(data.APODERADO_COVALTO)} como Acreditante (el “Acreditante” y/o el “Banco”) con el Acreditado y Obligado(s) Solidario(s) especificados en el Anexo A, en su conjunto identificados como las Partes (las “Partes”); al tenor de las siguientes declaraciones y cláusulas:\n------------------------------------------------- DECLARACIONES\nI. Declaraciones del Acreditante. Declara “BANCO COVALTO”, SOCIEDAD ANÓNIMA INSTITUCIÓN DE BANCA MÚLTIPLE, a través de su representante, que:\n(a) Es una Institución de Crédito, constituida y existente conforme a las leyes de los Estados Unidos Mexicanos (“México”), según consta en la escritura número setenta y ocho mil ciento cuatro, de fecha tres de junio del año dos mil tres, otorgada ante la fe del Licenciado José Visoso del Valle, Notario Público número noventa y dos de la Ciudad de México.\n(b) Es una Institución de Crédito, debidamente autorizada por la Secretaría de Hacienda y Crédito Público para actuar como Institución de Banca Múltiple y se encuentra facultada para celebrar el presente contrato y para asumir y dar cumplimiento a las obligaciones que en el mismo se establecen.\n(c) Su Registro Federal de Contribuyentes es “GFI0306041K7”.\n(d) Tiene su domicilio, para efectos de la Cláusula Vigésima Cuarta de este instrumento, en calle Ferrocarril de Cuernavaca número seiscientos ochenta y nueve, piso nueve, colonia Granada, Alcaldía Miguel Hidalgo, código postal once mil quinientos veintinueve, en la Ciudad de México.\n(e) La suscripción, entrega y cumplimiento del presente instrumento está comprendido dentro de su objeto social, ha sido debidamente autorizado por todos los órganos corporativos correspondientes y no viola: (i) sus estatutos vigentes a la fecha de este documento; ni (ii) ley o disposición normativa o contractual alguna que le obligue o afecte.\n(f) Explicó a las partes de este instrumento el contenido y alcance del mismo.\n(g) Su “Aviso de Privacidad” vigente se encuentra disponible al público en general en el portal de Internet “https://covalto.com/privacidad/#info”; en la inteligencia que, el mismo podrá variar de tiempo en tiempo.\n(h) Su representante cuenta con facultades suficientes para celebrar el presente instrumento en su nombre y representación; facultades que no le han sido revocadas, modificadas o limitadas en forma alguna a la fecha de firma de este documento.\n(i) Con base en las declaraciones del Acreditado y del Obligado Solidario, así como en la información legal y financiera y demás información proporcionada por éstos al Acreditante, y sujeto a los términos y condiciones previstos en el presente instrumento conviene en celebrar el presente contrato.`,
        }
      ];

      return cells.map((cell, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        title: cell.title,
        content: cell.content.trim().replace(/\n/g, '<br />'),
        visible: true,
      }));
    }
  },
];
