/**
 * Image Analysis Types
 */

export interface ImageQualityMetrics {
  isBlurry: boolean;
  blurScore: number;
  qualityScore: number;
  issues: string[];
}

export interface AnalysisUploadInfo {
  studentName: string;
  requirementName: string;
  fileName: string;
}

export interface AnalysisConfig {
  apiKey: string;
  minQualityScore?: number;
  maxRetries?: number;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;
  currentFile?: string;
  error?: string;
}
