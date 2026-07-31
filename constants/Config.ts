import Constants from 'expo-constants';

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
 * OpenAI API Key for NMAT Extraction
 */
export const EXPO_OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_EXPO_OPENAI_API_KEY ||
  process.env.EXPO_OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  Constants.expoConfig?.extra?.EXPO_OPENAI_API_KEY ||
  '';


