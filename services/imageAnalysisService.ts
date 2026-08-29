import axios from 'axios';
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

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
      }
    );

    const json = response.data;
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
 * Comprehensive Document Verification: Quality (blur) + Requirement Name Matching + NMAT Extraction
 */
export interface DocumentValidationResult {
  valid: boolean;
  is_blurry: boolean;
  blurScore: number;
  sharpScore: number;
  is_matching_requirement: boolean;
  detected_type?: string;
  detected_title?: string;
  mismatch_reason?: string;
  is_nmat_document?: boolean;
  percentile_rank?: number | null;
  reason?: string;
}

export const validateDocumentWithOpenAI = async (
  fileUri: string,
  requirementName: string,
  apiKey?: string
): Promise<DocumentValidationResult> => {
  try {
    const keyToUse = apiKey || EXPO_OPENAI_API_KEY;
    if (!keyToUse) {
      console.warn('OpenAI API key is missing.');
      return {
        valid: true,
        is_blurry: false,
        blurScore: 0,
        sharpScore: 100,
        is_matching_requirement: true,
        reason: 'OpenAI API key not configured',
      };
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
      return {
        valid: false,
        is_blurry: true,
        blurScore: 100,
        sharpScore: 0,
        is_matching_requirement: false,
        reason: 'Unable to read file data for analysis',
      };
    }

    let mimeType = 'image/jpeg';
    const lower = fileUri.toLowerCase();
    if (lower.endsWith('.png') || lower.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (lower.endsWith('.webp') || lower.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    } else if (lower.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    const prompt = `You are an official academic document verification AI for Southwestern University PHINMA School of Medicine.
Strictly analyze this uploaded document image against the required requirement name.

Target Requirement Slot: "${requirementName}"

Perform the following 3 comprehensive checks:

CHECK 1 – Image Quality & Legibility:
- Is the document image blurry, unreadable, dark, or too low-resolution to verify text, seals, or numbers?
- Set "is_blurry" to true if yes, and describe the blurriness in "blurry_reason".
- Set "blur_score" (0-100 where 0 is clear and 100 is completely blurry).

CHECK 2 – Document Classification & Requirement Matching:
- Identify what type of document this actually is:
  * "PSA_BIRTH_CERTIFICATE" / "NSO_BIRTH_CERTIFICATE" (Certificate of Live Birth issued by Philippine Statistics Authority / National Statistics Office, Municipal Form No. 102, BReN, Civil Registrar seals, SECPA security paper)
  * "TOR_TRANSCRIPT" (Official Transcript of Records, collegiate subjects/grades, university seal/registrar signature)
  * "NMAT_EXAMINEE_REPORT" (National Medical Admission Test Examinee Report Form by Center for Educational Measurement, Inc. / CEM)
  * "GOOD_MORAL_CERTIFICATE" (Certificate of Good Moral Character / Conduct Clearance from Dean or Guidance Office)
  * "UNDERTAKING_WAIVER" (Undertaking with Waiver, Release, Quitclaim for NMAT or Failed Subjects)
  * "CERTIFICATE_OF_GRADUATION" / "DIPLOMA" (College Diploma or Certificate of Graduation / Completion)
  * "HONORABLE_DISMISSAL" / "TRANSFER_CREDENTIAL" (Honorable Dismissal / Transfer Credential Certificate)
  * "MEDICAL_CLEARANCE" (Medical Examination / Diagnostic Physical Fitness Clearance, Laboratory Results)
  * "GOVERNMENT_ID" (Passport, Driver's License, UMID, National ID)
  * "OTHER_UNKNOWN" (Non-academic document, selfie, random photo, or unidentifiable file)
- State the readable human title in "detected_title" (e.g. "PSA Certificate of Live Birth", "Official Transcript of Records", "NMAT Examinee Report Form", etc.).
- Determine if the uploaded document MATCHES the target requirement "${requirementName}".
  * Set "is_matching_requirement" to true ONLY if the document satisfies the requirement slot.
  * Set "is_matching_requirement" to false if the student uploaded the wrong document (e.g. uploading a Driver's License or Medical Clearance to the "PSA Birth Certificate" slot, or a selfie to the "Transcript of Records" slot).
  * If false, provide a clear, polite explanation in "mismatch_reason".

CHECK 3 – NMAT Score Extraction (if NMAT document):
- If this is an NMAT Examinee Report Form (issued by CEM):
  * Find the section labeled "General Performance Score (GPS)".
  * In that section, extract the number or value directly next to "Percentile Rank" (e.g. 38, 42, 75, 92, 99+). Do NOT extract the Standard Score (e.g. 800).
  * IMPORTANT: If the Percentile Rank is "99+" or "99" or "99.0+", normalize and return it as 99 (or "99+"). It is a valid top score meeting university standards and must NOT be rejected.
  * Set "is_nmat_document" to true and "percentile_rank" to the numeric percentile value (return 99 for 99+).
- Otherwise, set "is_nmat_document" to false and "percentile_rank" to null.

RESPOND ONLY with this exact JSON structure:
{
    "is_blurry": boolean,
    "blur_score": number,
    "blurry_reason": string or null,
    "detected_type": string,
    "detected_title": string,
    "is_matching_requirement": boolean,
    "mismatch_reason": string or null,
    "is_nmat_document": boolean,
    "percentile_rank": number or string or null
}`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
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
      max_tokens: 250,
      temperature: 0.1,
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
      }
    );

    const json = response.data;
    const contentText = json?.choices?.[0]?.message?.content;
    if (!contentText) {
      return {
        valid: false,
        is_blurry: false,
        blurScore: 0,
        sharpScore: 100,
        is_matching_requirement: false,
        reason: 'Empty response from AI verification service',
      };
    }

    const parsed = JSON.parse(contentText);
    const blurScore = typeof parsed.blur_score === 'number' ? Math.round(parsed.blur_score) : parsed.is_blurry ? 70 : 15;
    const sharpScore = Math.max(0, Math.min(100, 100 - blurScore));
    const isBlurry = parsed.is_blurry === true || blurScore > 40;
    const isMatching = parsed.is_matching_requirement !== false;

    let percentileRank: number | null = null;
    if (parsed.percentile_rank !== null && parsed.percentile_rank !== undefined) {
      if (typeof parsed.percentile_rank === 'number') {
        percentileRank = parsed.percentile_rank;
      } else if (String(parsed.percentile_rank).includes('99')) {
        percentileRank = 99;
      } else {
        const num = parseFloat(String(parsed.percentile_rank).replace(/[^0-9.]/g, ''));
        percentileRank = isNaN(num) ? null : num;
      }
    }

    const valid = !isBlurry && isMatching;

    let reason: string | undefined = undefined;
    if (isBlurry) {
      reason = parsed.blurry_reason || 'The uploaded document image is blurry or difficult to read. Please upload a clearer copy.';
    } else if (!isMatching) {
      reason = parsed.mismatch_reason || `The uploaded document appears to be "${parsed.detected_title || 'a different document'}", which does not match the required slot "${requirementName}". Please upload the correct document.`;
    }

    return {
      valid,
      is_blurry: isBlurry,
      blurScore,
      sharpScore,
      is_matching_requirement: isMatching,
      detected_type: parsed.detected_type,
      detected_title: parsed.detected_title,
      mismatch_reason: parsed.mismatch_reason,
      is_nmat_document: parsed.is_nmat_document,
      percentile_rank: percentileRank,
      reason,
    };
  } catch (error: unknown) {
    console.error('Error in validateDocumentWithOpenAI:', error);
    return {
      valid: false,
      is_blurry: false,
      blurScore: 0,
      sharpScore: 100,
      is_matching_requirement: false,
      reason: error instanceof Error ? error.message : 'Failed to verify document',
    };
  }
};
