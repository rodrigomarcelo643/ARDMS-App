import { readAsStringAsync, EncodingType } from 'expo-file-system';
import { EXPO_OPENAI_API_KEY } from '@/constants/Config';

export interface NmatExtractionResult {
  success: boolean;
  percentileRank: number | null;
  found: boolean;
  reason?: string;
}

/**
 * Extract NMAT Percentile Rank from an image file using OpenAI Vision API
 * @param fileUri Local URI of the document/image file
 * @param apiKey OpenAI API Key (EXPO_OPENAI_API_KEY)
 */
export const extractNmatPercentileFromImage = async (
  fileUri: string,
  apiKey?: string
): Promise<NmatExtractionResult> => {
  try {
    const keyToUse = apiKey || EXPO_OPENAI_API_KEY;
    if (!keyToUse) {
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: 'OpenAI API key (EXPO_OPENAI_API_KEY) is missing.',
      };
    }

    // Read image file as Base64
    const base64Data = await readAsStringAsync(fileUri, {
      encoding: EncodingType.Base64,
    });

    if (!base64Data) {
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: 'Unable to read image file data.',
      };
    }

    // Determine mime type or default to image/jpeg
    let mimeType = 'image/jpeg';
    if (fileUri.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    } else if (fileUri.toLowerCase().endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a document analyzer. Read the provided NMAT (National Medical Admission Test) result document and extract the Percentile Rank value. Respond ONLY with a JSON object in this format: {"found": true/false, "percentile_rank": <number or null>, "reason": "<brief explanation>"}',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.1,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('NMAT Extraction HTTP error:', response.status, errText);
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: `API returned HTTP error ${response.status}`,
      };
    }

    const json = await response.json();
    const contentText = json?.choices?.[0]?.message?.content;

    if (!contentText) {
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: 'Empty response from OpenAI Vision API',
      };
    }

    const parsed = JSON.parse(contentText);
    const percentileRank =
      typeof parsed.percentile_rank === 'number'
        ? parsed.percentile_rank
        : parsed.percentile_rank
        ? parseFloat(parsed.percentile_rank)
        : null;

    const found = parsed.found === true || (percentileRank !== null && !isNaN(percentileRank));

    return {
      success: true,
      found,
      percentileRank: found && !isNaN(percentileRank as number) ? percentileRank : null,
      reason: parsed.reason || (found ? 'Score extracted successfully' : 'NMAT percentile rank not found'),
    };
  } catch (error: unknown) {
    console.error('Error extracting NMAT percentile:', error);
    const errMessage = error instanceof Error ? error.message : 'Failed to analyze document';
    return {
      success: false,
      percentileRank: null,
      found: false,
      reason: errMessage,
    };
  }
};
