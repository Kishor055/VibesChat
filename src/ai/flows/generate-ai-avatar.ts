'use server';
/**
 * @fileOverview Genkit flow for generating cosmic-themed user avatars.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAiAvatarInputSchema = z.object({
  theme: z.string().describe('The cosmic theme for the avatar (e.g., nebula, supernova, galactic knight).'),
});
export type GenerateAiAvatarInput = z.infer<typeof GenerateAiAvatarInputSchema>;

const GenerateAiAvatarOutputSchema = z.object({
  avatarUrl: z.string().describe('The data URI of the generated avatar image.'),
});
export type GenerateAiAvatarOutput = z.infer<typeof GenerateAiAvatarOutputSchema>;

export async function generateAiAvatar(input: GenerateAiAvatarInput): Promise<GenerateAiAvatarOutput> {
  return generateAiAvatarFlow(input);
}

const generateAiAvatarFlow = ai.defineFlow(
  {
    name: 'generateAiAvatarFlow',
    inputSchema: GenerateAiAvatarInputSchema,
    outputSchema: GenerateAiAvatarOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3.0-generate-001',
      prompt: `A professional, high-quality profile avatar for a cosmic explorer. Theme: ${input.theme}. Style: Sci-fi digital art, vibrant ethereal lighting, high detail, centered portrait.`,
    });

    if (!media) {
      throw new Error('Failed to forge cosmic avatar.');
    }

    return {
      avatarUrl: media.url,
    };
  }
);
