/**
 * Structured logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: string;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  debug: (message: string, data?: any) => {
    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };
    console.error(formatLog(entry));
  },

  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };
    console.error(formatLog(entry));
  },

  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };
    console.error(formatLog(entry));
  },

  error: (message: string, error?: any) => {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
    console.error(formatLog(entry));
  },
};

