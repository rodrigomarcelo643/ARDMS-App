import { readAsStringAsync, EncodingType } from 'expo-file-system';
import { EXPO_GEMINI_API_KEY } from '@/constants/Config';

export interface NmatExtractionResult {
  success: boolean;
  percentileRank: number | null;
  found: boolean;
  reason?: string;
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const extractNmatPercentileFromImage = async (
  fileUri: string,
  apiKey?: string
): Promise<NmatExtractionResult> => {
  try {
    const keyToUse = apiKey || EXPO_GEMINI_API_KEY;
    if (!keyToUse) {
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: 'Gemini API key (EXPO_PUBLIC_GEMINI_API_KEY) is missing.',
      };
    }

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

    let mimeType = 'image/jpeg';
    if (fileUri.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    else if (fileUri.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';

    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'You are a document analyzer. Read the provided NMAT (National Medical Admission Test) result document and extract the Percentile Rank value. Respond ONLY with a JSON object in this exact format: {"found": true/false, "percentile_rank": <number or null>, "reason": "<brief explanation>"}',
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 150,
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${keyToUse}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('NMAT Gemini HTTP error:', response.status, errText);
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: `Gemini API returned HTTP error ${response.status}`,
      };
    }

    const json = await response.json();
    const contentText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      return {
        success: false,
        percentileRank: null,
        found: false,
        reason: 'Empty response from Gemini Vision API',
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
    return {
      success: false,
      percentileRank: null,
      found: false,
      reason: error instanceof Error ? error.message : 'Failed to analyze document',
    };
  }
};
