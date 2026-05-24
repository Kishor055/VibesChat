'use server';
/**
 * @fileOverview Genkit flow for generating cosmic-themed media.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCosmicMediaInputSchema = z.object({
  prompt: z.string().describe('The description of the cosmic image to generate.'),
});
export type GenerateCosmicMediaInput = z.infer<typeof GenerateCosmicMediaInputSchema>;

const GenerateCosmicMediaOutputSchema = z.object({
  mediaUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateCosmicMediaOutput = z.infer<typeof GenerateCosmicMediaOutputSchema>;

export async function generateCosmicMedia(input: GenerateCosmicMediaInput): Promise<GenerateCosmicMediaOutput> {
  return generateCosmicMediaFlow(input);
}

const generateCosmicMediaFlow = ai.defineFlow(
  {
    name: 'generateCosmicMediaFlow',
    inputSchema: GenerateCosmicMediaInputSchema,
    outputSchema: GenerateCosmicMediaOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-3.0-generate-001',
      prompt: `A high-quality, professional cosmic digital art piece. Theme: ${input.prompt}. Style: Cinematic, ethereal, vibrant colors, deep space aesthetics.`,
    });

    if (!media) {
      throw new Error('Failed to generate media.');
    }

    return {
      mediaUrl: media.url,
    };
  }
);
