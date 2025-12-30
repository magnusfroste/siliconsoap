/**
 * Centralized logging utility
 * Only logs in development mode to prevent console pollution in production
 */

import { isDevelopment } from './env';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private enabled: boolean;

  constructor() {
    this.enabled = isDevelopment();
  }

  log(...args: unknown[]): void {
    if (this.enabled) {
      console.log(...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.enabled) {
      console.info(...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn(...args);
    }
  }

  error(...args: unknown[]): void {
    // Always log errors, even in production
    console.error(...args);
  }

  debug(...args: unknown[]): void {
    if (this.enabled) {
      console.debug(...args);
    }
  }

  group(label: string): void {
    if (this.enabled) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.enabled) {
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.enabled) {
      console.table(data);
    }
  }
}

export const logger = new Logger();
