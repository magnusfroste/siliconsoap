/**
 * Environment variable validation and access
 * Ensures all required environment variables are present at startup
 */

interface EnvironmentConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseProjectId: string;
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID'
] as const;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variables are missing
 */
export const validateEnvironment = (): void => {
  const missing = requiredEnvVars.filter(
    key => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(key => `  - ${key}`).join('\n')}\n\n` +
      `Please create a .env file based on .env.example and fill in the required values.`
    );
  }
};

/**
 * Gets validated environment configuration
 * @returns Environment configuration object
 */
export const getEnvironment = (): EnvironmentConfig => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID
  };
};

/**
 * Checks if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Checks if running in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};
