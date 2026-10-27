// Pure mapping from a debate generation error to what the visitor sees.
export interface GenerationErrorView {
  title: string;
  message: string;
  action: 'retry' | 'signin';
}

export const GENERATION_ERROR_TITLE = "The debate couldn't start";
export const NETWORK_ERROR_MESSAGE = "We couldn't reach the AI models. Check your connection (some networks block our server) and try again.";
export const GENERIC_ERROR_MESSAGE = 'Something went wrong while the models were answering. Try again.';

const isNetworkError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const e = error as { name?: string; message?: string };
  if (e.name === 'FunctionsFetchError') return true;
  const msg = (e.message || '').toLowerCase();
  return (e.name === 'TypeError' && msg.includes('fetch')) || msg.includes('failed to fetch') || msg.includes('failed to send a request') || msg.includes('networkerror');
};

export const describeGenerationError = (error: unknown): GenerationErrorView => {
  const e = (error && typeof error === 'object' ? error : {}) as { code?: unknown; message?: unknown; name?: string };
  if (typeof e.code === 'string' && e.code && typeof e.message === 'string' && e.message && e.name === 'GenerationApiError') {
    return { title: GENERATION_ERROR_TITLE, message: e.message, action: e.code === 'DAILY_LIMIT' ? 'signin' : 'retry' };
  }
  if (isNetworkError(error)) return { title: GENERATION_ERROR_TITLE, message: NETWORK_ERROR_MESSAGE, action: 'retry' };
  return { title: GENERATION_ERROR_TITLE, message: GENERIC_ERROR_MESSAGE, action: 'retry' };
};

export const noCreditsMessage = (isGuest: boolean): string =>
  isGuest ? "You've used your free debates. Sign up to get more." : 'No credits remaining. Please purchase more credits to continue.';
