'use server';
/**
 * @fileOverview Summarizes a contract to extract key obligations, rights, and risks.
 *
 * - summarizeContractForReview - A function that handles the contract summarization process.
 * - SummarizeContractForReviewInput - The input type for the summarizeContractForReview function.
 * - SummarizeContractForReviewOutput - The return type for the summarizeContractForReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContractForReviewInputSchema = z.object({
  contractText: z.string().describe('The text of the contract to summarize.'),
});
export type SummarizeContractForReviewInput = z.infer<typeof SummarizeContractForReviewInputSchema>;

const SummarizeContractForReviewOutputSchema = z.object({
  summary: z.string().describe('A summary of the key obligations, rights, and risks in the contract.'),
});
export type SummarizeContractForReviewOutput = z.infer<typeof SummarizeContractForReviewOutputSchema>;

export async function summarizeContractForReview(input: SummarizeContractForReviewInput): Promise<SummarizeContractForReviewOutput> {
  return summarizeContractForReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContractForReviewPrompt',
  input: {schema: SummarizeContractForReviewInputSchema},
  output: {schema: SummarizeContractForReviewOutputSchema},
  prompt: `You are a legal expert. Summarize the following contract, extracting the key obligations, rights, and risks. Be concise and clear.

Contract Text:
{{{contractText}}}`,
});

const summarizeContractForReviewFlow = ai.defineFlow(
  {
    name: 'summarizeContractForReviewFlow',
    inputSchema: SummarizeContractForReviewInputSchema,
    outputSchema: SummarizeContractForReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
