import { useState, useCallback } from 'react';
import { NmatValidationState, NmatValidationResult, NmatScore, NMAT_PASSING_RATE } from '@/@types/screens/nmat-validation';
import { API_BASE_URL } from '@/constants/Config';

export const useNmatValidation = () => {
  const [state, setState] = useState<NmatValidationState>({
    data: null,
    loading: false,
    error: null,
  });

  const validateScore = useCallback((score: NmatScore): NmatValidationResult => {
    const isPassing = score.percentile_rank >= NMAT_PASSING_RATE;
    return {
      score,
      isPassing,
      passingRate: NMAT_PASSING_RATE,
      status: isPassing ? 'passed' : 'failed',
    };
  }, []);

  const fetchNmatScore = useCallback(async (studentId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/nmat-score/${studentId}`);
      const json = await response.json();

      if (!json.success) {
        setState(prev => ({ ...prev, loading: false, error: json.message || 'Failed to fetch NMAT score' }));
        return;
      }

      const result = validateScore(json.data as NmatScore);
      setState({ data: result, loading: false, error: null });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message || 'Unexpected error' }));
    }
  }, [validateScore]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    fetchNmatScore,
    validateScore,
    reset,
  };
};
