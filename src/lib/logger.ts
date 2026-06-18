import fs from 'fs';
import path from 'path';

/**
 * Simple JSON logger that writes log entries to a file in the `logs` directory.
 * Each entry includes a timestamp, level, message, and optional meta data.
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

const logsDir = path.resolve(process.cwd(), 'logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ File logging disabled (read-only filesystem):', (err as Error).message);
}

function writeLog(entry: LogEntry) {
  // Always output to standard console in all environments
  const consoleMethod = entry.level === LogLevel.ERROR ? 'error' : entry.level === LogLevel.WARN ? 'warn' : 'log';
  console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.meta ? JSON.stringify(entry.meta) : '');

  try {
    const logPath = path.join(logsDir, 'auth.log');
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logPath, line, { encoding: 'utf8' });
  } catch (err) {
    // Silently ignore write failures (e.g. read-only filesystem on Netlify/Lambda)
  }
}

export function logInfo(message: string, meta?: Record<string, unknown>) {
  writeLog({ timestamp: new Date().toISOString(), level: LogLevel.INFO, message, meta });
}

export function logWarn(message: string, meta?: Record<string, unknown>) {
  writeLog({ timestamp: new Date().toISOString(), level: LogLevel.WARN, message, meta });
}

export function logError(message: string, meta?: Record<string, unknown>) {
  writeLog({ timestamp: new Date().toISOString(), level: LogLevel.ERROR, message, meta });
}

export function logDebug(message: string, meta?: Record<string, unknown>) {
  writeLog({ timestamp: new Date().toISOString(), level: LogLevel.DEBUG, message, meta });
}
