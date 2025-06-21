'use server';
/**
 * @fileOverview Genkit flow to fetch contract data from BigQuery.
 *
 * - fetchContractDataFromBigQuery - Fetches contract data based on a record ID.
 * - FetchContractDataInput - Input type for the flow.
 * - FetchContractDataOutput - Output type for the flow (or null if not found).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getContractDataById } from '@/services/bigquery-service';

const FetchContractDataInputSchema = z.object({
  recordId: z.string().describe('The ID of the record to fetch from BigQuery.'),
});
export type FetchContractDataInput = z.infer<typeof FetchContractDataInputSchema>;

// This schema combines all possible fields from all templates to be robust.
// It uses the exact 'id' from the template definitions.
const FetchContractDataOutputSchema = z.object({
  id: z.string().optional(),
  
  // Fields from NDA, Services, and/or SaaS templates
  nombre_parte_uno: z.string().optional().nullable(),
  direccion_parte_uno: z.string().optional().nullable(),
  nombre_parte_dos: z.string().optional().nullable(),
  direccion_parte_dos: z.string().optional().nullable(),
  fecha_efectiva: z.string().optional().nullable(),
  precio_total: z.union([z.string(), z.number()]).optional().nullable(),

  // NDA specific fields
  vigencia_en_anios: z.union([z.string(), z.number()]).optional().nullable(),
  proposito_divulgacion: z.string().optional().nullable(),
  descripcion_servicio: z.string().optional().nullable(),
  cantidad: z.union([z.string(), z.number()]).optional().nullable(),
  precio_unitario: z.union([z.string(), z.number()]).optional().nullable(),

  // Services specific fields
  descripcion_detallada_servicios: z.string().optional().nullable(),
  entregables: z.string().optional().nullable(),
  plazo_ejecucion: z.string().optional().nullable(),
  condiciones_pago: z.string().optional().nullable(),

  // SaaS specific fields
  nombre_software: z.string().optional().nullable(),
  nivel_servicio_sla: z.string().optional().nullable(),
  usuarios_permitidos: z.union([z.string(), z.number()]).optional().nullable(),
  politica_soporte: z.string().optional().nullable(),
  frecuencia_pago: z.string().optional().nullable(),

}).nullable(); // The entire object can be null if no record is found

export type FetchContractDataOutput = z.infer<typeof FetchContractDataOutputSchema>;

export async function fetchContractDataFromBigQuery(
  input: FetchContractDataInput
): Promise<FetchContractDataOutput> {
  return fetchContractDataFromBigQueryFlow(input);
}

const fetchContractDataFromBigQueryFlow = ai.defineFlow(
  {
    name: 'fetchContractDataFromBigQueryFlow',
    inputSchema: FetchContractDataInputSchema,
    outputSchema: FetchContractDataOutputSchema,
  },
  async (input: FetchContractDataInput): Promise<FetchContractDataOutput> => {
    try {
      const data = await getContractDataById(input.recordId);
      if (!data) {
        return null;
      }
      // Ensure data conforms to the output schema.
      // Zod will parse the data, and any fields not in the schema will be stripped.
      const parsedData = FetchContractDataOutputSchema.parse(data);
      return parsedData;
    } catch (error) {
      console.error('Error in fetchContractDataFromBigQueryFlow:', error);
      throw error; 
    }
  }
);
