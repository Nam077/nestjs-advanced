interface Log {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
}

/**
 * Formats a log entry into a string.
 * @param {Log} log - The log entry to format.
 * @returns {string} The formatted log entry.
 */
export const formatLog = ({
  timestamp,
  level,
  message,
  context,
}: Log): string => {
  const contextInfo = context ? ` [${context}]` : '';

  return `[${timestamp}] [${level.toUpperCase()}]${contextInfo} ${message}`;
};
