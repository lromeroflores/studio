/**
 * @fileOverview Service for interacting with Google BigQuery.
 *
 * - getContractDataById - Fetches contract data from BigQuery based on a record ID.
 */
'use server';

import { BigQuery } from '@google-cloud/bigquery';
import type { ContractTemplate } from '@/components/contract/types'; // Assuming this path might be useful later
import { defaultTemplates } from '@/lib/templates'; // To get field names for select query

// Initialize BigQuery client
// The client will use Application Default Credentials (ADC)
// or the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const bigquery = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const datasetId = process.env.BIGQUERY_DATASET_ID;
const tableId = process.env.BIGQUERY_TABLE_ID;

interface ContractDataRecord {
  id: string;
  [key: string]: any; // Allow other properties
}

/**
 * Fetches contract data from BigQuery for a given record ID.
 * Assumes the table has an 'id' column for querying and columns matching contract field IDs.
 * @param recordId The ID of the record to fetch.
 * @returns A promise that resolves to the contract data object or null if not found.
 */
export async function getContractDataById(recordId: string): Promise<Record<string, any> | null> {
  if (!projectId || !datasetId || !tableId) {
    console.error('BigQuery environment variables (GOOGLE_CLOUD_PROJECT, BIGQUERY_DATASET_ID, BIGQUERY_TABLE_ID) are not set.');
    throw new Error('BigQuery configuration is incomplete. Please check environment variables.');
  }

  // Dynamically generate SELECT clause based on NDA template fields
  // This is a simplification; a more robust solution might involve schema mapping
  const ndaTemplate = defaultTemplates.find(t => t.id === 'nda-v1');
  if (!ndaTemplate) {
    console.error('NDA template not found, cannot construct BigQuery SELECT clause.');
    throw new Error('Default NDA template not found.');
  }

  const selectFields = ndaTemplate.fields.map(field => field.id).join(', ');

  const query = `
    SELECT id, ${selectFields}
    FROM \`${projectId}.${datasetId}.${tableId}\`
    WHERE id = @recordId
    LIMIT 1;
  `;

  const options = {
    query: query,
    params: { recordId: recordId },
  };

  try {
    console.log(`Executing BigQuery query: ${query} with params: ${JSON.stringify(options.params)}`);
    const [rows] = await bigquery.query(options);

    if (rows.length > 0) {
      console.log('Data fetched from BigQuery:', rows[0]);
      return rows[0] as ContractDataRecord;
    } else {
      console.log('No data found in BigQuery for ID:', recordId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching data from BigQuery:', error);
    throw new Error(`Failed to fetch data from BigQuery: ${error instanceof Error ? error.message : String(error)}`);
  }
}
