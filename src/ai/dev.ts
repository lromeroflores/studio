import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-contract-clause.ts';
import '@/ai/flows/summarize-contract-for-review.ts';
import '@/ai/flows/renumber-contract-flow.ts';
import '@/ai/flows/rewrite-contract-clause.ts';
