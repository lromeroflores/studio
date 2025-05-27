'use server';

/**
 * @fileOverview AI-powered contract clause suggestion flow.
 *
 * - suggestContractClause - A function that suggests contract clauses based on a description.
 * - SuggestContractClauseInput - The input type for the suggestContractClause function.
 * - SuggestContractClauseOutput - The return type for the suggestContractClause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestContractClauseInputSchema = z.object({
  clauseDescription: z
    .string()
    .describe('A description of the clause the user wants to add to the contract.'),
});
export type SuggestContractClauseInput = z.infer<typeof SuggestContractClauseInputSchema>;

const SuggestContractClauseOutputSchema = z.object({
  suggestedClause: z
    .string()
    .describe('The AI-suggested legal wording for the contract clause.'),
});
export type SuggestContractClauseOutput = z.infer<typeof SuggestContractClauseOutputSchema>;

export async function suggestContractClause(
  input: SuggestContractClauseInput
): Promise<SuggestContractClauseOutput> {
  return suggestContractClauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContractClausePrompt',
  input: {schema: SuggestContractClauseInputSchema},
  output: {schema: SuggestContractClauseOutputSchema},
  prompt: `You are a legal expert specializing in contract law.

  Based on the user's description, suggest appropriate legal wording for a contract clause.

  Description: {{{clauseDescription}}}`,
});

const suggestContractClauseFlow = ai.defineFlow(
  {
    name: 'suggestContractClauseFlow',
    inputSchema: SuggestContractClauseInputSchema,
    outputSchema: SuggestContractClauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
