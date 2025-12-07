import { useModelsContext } from '../context/ModelsContext';

// Re-export the context hook as useModels for backward compatibility
export const useModels = (_apiKey: string) => {
  void _apiKey; // Suppress unused parameter warning
  return useModelsContext();
};
