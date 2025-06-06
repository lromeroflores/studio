import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-contract-clause.ts';
import '@/ai/flows/summarize-contract-for-review.ts';
import '@/ai/flows/fetch-contract-data-from-bigquery.ts';
import '@/ai/flows/renumber-contract-flow.ts';
