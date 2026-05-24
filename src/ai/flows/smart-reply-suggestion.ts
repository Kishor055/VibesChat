'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating smart reply suggestions in a chat application.
 *
 * - suggestSmartReplies - A function that provides quick, context-aware reply options.
 * - SmartReplySuggestionInput - The input type for the suggestSmartReplies function.
 * - SmartReplySuggestionOutput - The return type for the suggestSmartReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplySuggestionInputSchema = z.object({
  conversationHistory: z.array(z.object({
    speaker: z.string().describe('The name or ID of the speaker.'),
    text: z.string().describe('The content of the message.'),
  })).describe('A chronologically ordered array of previous messages in the chat, including the speaker and their message.'),
  currentMessage: z.string().describe('The most recent message in the conversation for which quick replies are being suggested.'),
});
export type SmartReplySuggestionInput = z.infer<typeof SmartReplySuggestionInputSchema>;

const SmartReplySuggestionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of short, contextually relevant quick reply suggestions.'),
});
export type SmartReplySuggestionOutput = z.infer<typeof SmartReplySuggestionOutputSchema>;

export async function suggestSmartReplies(input: SmartReplySuggestionInput): Promise<SmartReplySuggestionOutput> {
  return smartReplySuggestionFlow(input);
}

const smartReplyPrompt = ai.definePrompt({
  name: 'smartReplySuggestionPrompt',
  input: {schema: SmartReplySuggestionInputSchema},
  output: {schema: SmartReplySuggestionOutputSchema},
  prompt: `You are an intelligent assistant designed to suggest quick, context-aware replies for a chat application.
Analyze the provided conversation history and the most recent message to generate 3-5 relevant and concise reply options.
The replies should be natural and directly respond to the context of the conversation.

Conversation History:
{{#each conversationHistory}}
  {{speaker}}: {{text}}
{{/each}}

Current Message to reply to:
User: {{{currentMessage}}}

Please provide your suggestions in JSON format, adhering to the following schema:
{{jsonSchema outputSchema}}`,
});

const smartReplySuggestionFlow = ai.defineFlow(
  {
    name: 'smartReplySuggestionFlow',
    inputSchema: SmartReplySuggestionInputSchema,
    outputSchema: SmartReplySuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await smartReplyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate smart reply suggestions.');
    }
    return output;
  }
);
