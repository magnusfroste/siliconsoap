
import { useState } from 'react';

/**
 * Hook to manage analysis state
 */
export const useAnalysisState = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>('');
  // Default to Llama 3.3 70B
  const [analyzerModel, setAnalyzerModel] = useState<string>('meta-llama/llama-3.3-70b-instruct:free');

  return {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel
  };
};
