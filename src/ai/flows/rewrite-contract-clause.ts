'use server';
/**
 * @fileOverview AI-powered contract clause rewriting flow.
 *
 * - rewriteContractClause - A function that rewrites a contract clause based on user instructions.
 * - RewriteContractClauseInput - The input type for the function.
 * - RewriteContractClauseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteContractClauseInputSchema = z.object({
  clauseText: z.string().describe('The original text of the contract clause to be rewritten.'),
  rewriteInstruction: z
    .string()
    .describe('The user\'s instruction on how the clause should be rewritten.'),
});
export type RewriteContractClauseInput = z.infer<typeof RewriteContractClauseInputSchema>;

const RewriteContractClauseOutputSchema = z.object({
  rewrittenClauseText: z
    .string()
    .describe('The rewritten contract clause text.'),
});
export type RewriteContractClauseOutput = z.infer<typeof RewriteContractClauseOutputSchema>;

export async function rewriteContractClause(
  input: RewriteContractClauseInput
): Promise<RewriteContractClauseOutput> {
  return rewriteContractClauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteContractClausePrompt',
  input: {schema: RewriteContractClauseInputSchema},
  output: {schema: RewriteContractClauseOutputSchema},
  prompt: `You are an expert legal assistant. Your task is to rewrite a specific contract clause based on the user's instructions.

You must maintain a professional, legal tone and ensure the rewritten clause is clear and unambiguous. Preserve the original intent unless the user explicitly asks to change it.

The numbering of the clause should be preserved if it exists in the original text.

User's Instruction:
"{{{rewriteInstruction}}}"

Original Clause Text:
---
{{{clauseText}}}
---

Rewrite the clause and provide only the new text as your output.`,
});

const rewriteContractClauseFlow = ai.defineFlow(
  {
    name: 'rewriteContractClauseFlow',
    inputSchema: RewriteContractClauseInputSchema,
    outputSchema: RewriteContractClauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to return a rewritten clause.');
    }
    return output;
  }
);
