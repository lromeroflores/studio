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

export const FetchContractDataInputSchema = z.object({
  recordId: z.string().describe('The ID of the record to fetch from BigQuery.'),
});
export type FetchContractDataInput = z.infer<typeof FetchContractDataInputSchema>;

// Define an output schema that matches the fields of the NDA template.
// This makes the output predictable and type-safe.
// All fields are optional as they might not exist in BigQuery or be null.
export const FetchContractDataOutputSchema = z.object({
  id: z.string().optional(),
  partyOneName: z.string().optional().nullable(),
  partyOneAddress: z.string().optional().nullable(),
  partyTwoName: z.string().optional().nullable(),
  partyTwoAddress: z.string().optional().nullable(),
  effectiveDate: z.string().optional().nullable(), // Dates from BQ might be strings
  term: z.union([z.string(), z.number()]).optional().nullable(), // Term could be number or string if BQ stores it as such
  purpose: z.string().optional().nullable(),
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
      // BigQuery might return numbers as strings, dates as ISO strings etc.
      // Zod will attempt to coerce if types don't match exactly, based on schema.
      const parsedData = FetchContractDataOutputSchema.parse(data);
      return parsedData;
    } catch (error) {
      console.error('Error in fetchContractDataFromBigQueryFlow:', error);
      // Optionally re-throw or return a structured error object
      // For now, re-throwing will let the client handle it.
      throw error; 
    }
  }
);
