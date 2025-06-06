'use server';
/**
 * @fileOverview AI-powered contract re-numbering and cross-reference updating flow.
 *
 * - renumberContractFlow - A function that re-numbers clauses and updates cross-references in a contract.
 * - RenumberContractInput - The input type for the renumberContractFlow function.
 * - RenumberContractOutput - The return type for the renumberContractFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RenumberContractInputSchema = z.object({
  contractText: z.string().describe('The full text of the contract to be re-numbered.'),
});
export type RenumberContractInput = z.infer<typeof RenumberContractInputSchema>;

const RenumberContractOutputSchema = z.object({
  renumberedContractText: z
    .string()
    .describe('The contract text with all clauses sequentially re-numbered and cross-references updated.'),
});
export type RenumberContractOutput = z.infer<typeof RenumberContractOutputSchema>;

export async function renumberContract(
  input: RenumberContractInput
): Promise<RenumberContractOutput> {
  return renumberContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'renumberContractPrompt',
  input: {schema: RenumberContractInputSchema},
  output: {schema: RenumberContractOutputSchema},
  prompt: `You are an expert legal document processor. Your task is to meticulously analyze the provided contract text.
First, identify all distinct clauses, sections, or numbered/lettered paragraphs. This includes main clauses often starting with a number (e.g., "1. Purpose", "II. Confidentiality") and any sub-clauses (e.g., "(a)", "3.1"). Also consider ad-hoc clauses that might be appended, often marked like "--- AD-HOC CLAUSES --- 1. ...".

Second, re-number all identified top-level clauses sequentially, starting from 1. Sub-clauses should maintain their relationship to their parent clause (e.g., if "Section 2" becomes "Clause 3", then "2.1" should become "3.1" or "3.(a)" as appropriate to the original styling).

Third, after re-numbering, you MUST scan the entire document for any internal cross-references. These could be phrases like "as per clause 3", "see section 2.1", "refer to paragraph (b) of Article IV", "in accordance with the terms outlined in clause 1". You need to update these references to reflect the new sequential numbering you've applied. Be very careful to map old numbers to new numbers correctly.

Fourth, ensure that the formatting, including ad-hoc clause markers like "--- AD-HOC CLAUSES ---", is preserved as much as possible. Only the clause numbers and the numbers within cross-references should change.

Provide the complete, modified contract text as your output.

Original Contract Text:
{{{contractText}}}`,
});

const renumberContractFlow = ai.defineFlow(
  {
    name: 'renumberContractFlow',
    inputSchema: RenumberContractInputSchema,
    outputSchema: RenumberContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('The AI failed to return a renumbered contract.');
    }
    return output;
  }
);
