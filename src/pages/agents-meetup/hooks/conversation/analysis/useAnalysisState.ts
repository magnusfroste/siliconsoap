
import { useState } from 'react';

/**
 * Hook to manage analysis state
 */
export const useAnalysisState = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>('');
  // Default to paid Gemini Flash (admin can override via 'default_judge_model' flag)
  const [analyzerModel, setAnalyzerModel] = useState<string>('google/gemini-2.5-flash');

  return {
    isAnalyzing,
    setIsAnalyzing,
    analysisResults,
    setAnalysisResults,
    analyzerModel,
    setAnalyzerModel
  };
};
