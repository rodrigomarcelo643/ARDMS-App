import axios from 'axios';
import { ML_API_BASE_URL } from '@/constants/Config';

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
 * Analyze a single image for quality issues (blur, etc.)
 */
export const analyzeImage = async (
  fileId: number,
  apiKey: string
): Promise<ImageAnalysisResult> => {
  try {
    const response = await axios.post(
      `${ML_API_BASE_URL}/api/review`,
      { file_id: fileId, api_key: apiKey },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Analysis failed'
    };
  }
};

/**
 * Analyze multiple images in batch
 */
export const batchAnalyzeImages = async (
  fileIds: number[],
  apiKey: string
): Promise<BatchAnalysisResult> => {
  try {
    const response = await axios.post(
      `${ML_API_BASE_URL}/api/batch-review`,
      { file_ids: fileIds, api_key: apiKey },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Batch analysis failed'
    };
  }
};
