/**
 * Backend API BASE URL
 * @Author: Marcelo Rodrigo
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()!;

/**
 * ML Image Classifier API BASE URL (Render)
 */
export const ML_API_BASE_URL = process.env.EXPO_PUBLIC_ML_API_BASE_URL!;

/**
 * Gemini API Key for NMAT Extraction
 */
export const EXPO_GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';


