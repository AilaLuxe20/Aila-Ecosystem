export interface AILogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

const logs: AILogEntry[] = [];

export function addLog(level: AILogEntry["level"], message: string) {
  logs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message,
  });

  if (logs.length > 200) logs.pop();
}

export function getLogs() {
  return logs;
}
