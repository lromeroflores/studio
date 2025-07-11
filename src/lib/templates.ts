
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
    ],
    generateCells: (formData): ContractCell[] => {
      const data = {
        DIA_FIRMA: '[DIA_FIRMA]',
        MES_FIRMA: '[MES_FIRMA]',
        AÑO_FIRMA: '[AÑO_FIRMA]',
        NOMBRE_DE_LA_ACREDITADA: '[NOMBRE DE LA ACREDITADA]',
        NOMBRE_OBLIGADOS_SOLIDARIOS: '[NOMBRE OBLIGADOS SOLIDARIOS]',
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
          content: `CONTRATO DE APERTURA DE CRÉDITO Y OBLIGACIÓN SOLIDARIA\n\nde fecha ${styleVar(data.DIA_FIRMA)} de ${styleVar(data.MES_FIRMA)} de ${styleVar(data.AÑO_FIRMA)}\n\nque celebran\n\n\n${styleVar(data.NOMBRE_DE_LA_ACREDITADA)}\n\ncomo Acreditado \n\n\nBANCO COVALTO, S.A. INSTITUCIÓN DE BANCA MÚLTIPLE\n\ncomo Acreditante y\n\n\n${styleVar(data.NOMBRE_OBLIGADOS_SOLIDARIOS)}\n\ncomo Obligados Solidarios`,
        },
      ];

      return cells.map((cell, index) => ({
        id: `cell-${index}-${Math.random().toString(36).substring(2, 9)}`,
        title: cell.title,
        content: cell.content.trim(),
        visible: true,
      }));
    }
  },
];
