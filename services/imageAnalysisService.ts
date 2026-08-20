import { readAsStringAsync, EncodingType } from 'expo-file-system';
import { EXPO_OPENAI_API_KEY } from '@/constants/Config';

export interface ImageBlurCheckResult {
  isBlurry: boolean;
  blurScore: number;
  sharpScore: number;
  reason?: string;
}

export interface ImageAnalysisResult {
  success: boolean;
  result?: {
    is_blurry?: boolean;
    blur_score?: number;
    quality_score?: number;
    issues?: string[];
    upload?: {
      student_name: string;
      requirement_name: string;
      file_name: string;
    };
  };
  message?: string;
}

export interface BatchAnalysisResult {
  success: boolean;
  total?: number;
  results?: Array<{
    is_blurry?: boolean;
    blur_score?: number;
    quality_score?: number;
    issues?: string[];
    upload?: {
      student_name: string;
      requirement_name: string;
      file_name: string;
    };
  }>;
  message?: string;
}

/**
 * Check image blur and sharpness quality using OpenAI Vision API.
 * Replaces the ML Image Classifier on Render to eliminate cold-start/service errors
 * while retaining accurate blur evaluation and scoring (0-100).
 */
export const checkImageBlurWithOpenAI = async (
  fileUri: string,
  apiKey?: string
): Promise<ImageBlurCheckResult> => {
  try {
    const keyToUse = apiKey || EXPO_OPENAI_API_KEY;
    if (!keyToUse) {
      console.warn('OpenAI API key (EXPO_PUBLIC_OPENAI_API_KEY) is missing for blur check.');
      return { isBlurry: false, blurScore: 0, sharpScore: 100, reason: 'OpenAI API key missing' };
    }

    let base64Data: string;
    if (fileUri.startsWith('data:')) {
      base64Data = fileUri.split(',')[1] || '';
    } else {
      base64Data = await readAsStringAsync(fileUri, {
        encoding: EncodingType.Base64,
      });
    }

    if (!base64Data) {
      return { isBlurry: false, blurScore: 0, sharpScore: 100, reason: 'Unable to read image file data' };
    }

    let mimeType = 'image/jpeg';
    const lower = fileUri.toLowerCase();
    if (lower.endsWith('.png') || lower.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (lower.endsWith('.webp') || lower.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert document image quality analyzer. Analyze the provided document/record image specifically for blurriness, motion blur, out-of-focus blur, pixelation, low resolution, or poor text legibility.
Evaluate the image quality and respond ONLY with a valid JSON object in this exact format:
{
  "is_blurry": boolean,
  "blur_score": number,
  "sharp_score": number,
  "reason": "short explanation"
}
Rules:
- "is_blurry": true if the image is blurry, out-of-focus, smudged, illegible, or difficult to read; false if sharp, clear, in-focus, and legible.
- "blur_score": an integer from 0 to 100 representing how blurry the image is (0 = crystal clear/sharp, 100 = completely blurry/illegible). A score above 40 indicates unacceptable blur.
- "sharp_score": an integer from 0 to 100 representing sharpness and clarity (sharp_score + blur_score = 100).
- "reason": a concise explanation of the visual quality.`,
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
      console.error('OpenAI Blur Check HTTP error:', response.status, errText);
      return { isBlurry: false, blurScore: 0, sharpScore: 100, reason: `HTTP error ${response.status}` };
    }

    const json = await response.json();
    const contentText = json?.choices?.[0]?.message?.content;
    if (!contentText) {
      return { isBlurry: false, blurScore: 0, sharpScore: 100, reason: 'Empty response from OpenAI' };
    }

    const parsed = JSON.parse(contentText);
    let blurScore = typeof parsed.blur_score === 'number' ? Math.round(parsed.blur_score) : 0;
    let sharpScore = typeof parsed.sharp_score === 'number' ? Math.round(parsed.sharp_score) : (100 - blurScore);

    blurScore = Math.max(0, Math.min(100, blurScore));
    sharpScore = Math.max(0, Math.min(100, sharpScore));

    const isBlurry = parsed.is_blurry === true || blurScore > 40;

    if (isBlurry && blurScore <= 40) {
      blurScore = 60;
      sharpScore = 40;
    } else if (!isBlurry && blurScore > 40) {
      blurScore = 20;
      sharpScore = 80;
    }

    return {
      isBlurry,
      blurScore,
      sharpScore,
      reason: parsed.reason,
    };
  } catch (error: unknown) {
    console.error('Error in OpenAI Blur Check:', error);
    return {
      isBlurry: false,
      blurScore: 0,
      sharpScore: 100,
      reason: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
};

/**
 * Analyze a single image for quality issues (blur, etc.) using OpenAI
 */
export const analyzeImage = async (
  fileUriOrId: string | number,
  apiKey?: string
): Promise<ImageAnalysisResult> => {
  try {
    if (typeof fileUriOrId === 'string') {
      const blurRes = await checkImageBlurWithOpenAI(fileUriOrId, apiKey);
      return {
        success: true,
        result: {
          is_blurry: blurRes.isBlurry,
          blur_score: blurRes.blurScore,
          quality_score: blurRes.sharpScore,
          issues: blurRes.isBlurry ? [blurRes.reason || 'Image is blurry'] : [],
        },
      };
    }
    return {
      success: false,
      message: 'Direct fileId analysis requires a local image URI for OpenAI Vision analysis',
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || 'Analysis failed',
    };
  }
};

/**
 * Analyze multiple images in batch using OpenAI
 */
export const batchAnalyzeImages = async (
  fileUrisOrIds: (string | number)[],
  apiKey?: string
): Promise<BatchAnalysisResult> => {
  try {
    const results = await Promise.all(
      fileUrisOrIds.map(async (item) => {
        if (typeof item === 'string') {
          const res = await checkImageBlurWithOpenAI(item, apiKey);
          return {
            is_blurry: res.isBlurry,
            blur_score: res.blurScore,
            quality_score: res.sharpScore,
            issues: res.isBlurry ? [res.reason || 'Image is blurry'] : [],
          };
        }
        return {
          is_blurry: false,
          blur_score: 0,
          quality_score: 100,
          issues: ['Direct fileId analysis requires local image URI'],
        };
      })
    );

    return {
      success: true,
      total: results.length,
      results,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || 'Batch analysis failed',
    };
  }
};
