// JSON-lines logger with optional pretty-print.
//
// Used by the orchestrator and phase handlers to emit progress, decisions,
// and metrics. Logs go to stderr by default (so stdout stays clean for
// machine-readable output if the CLI ever grows that mode).

export interface LogEntry {
  level: "info" | "warn" | "error";
  phase?: string;
  message: string;
  uuid8?: string;
  /** Free-form additional context. Avoid huge payloads here — long text
   *  goes to OUTPUT_DIR files, not the log. */
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  /** Returns a logger that includes the given phase name in every entry. */
  withPhase(phase: string): Logger;
}

export interface LoggerConfig {
  /** "json" emits one JSON object per line (parseable by jq, log shippers).
   *  "pretty" emits human-readable colorized lines. Default "pretty" when
   *  stderr is a TTY, else "json". */
  format?: "json" | "pretty";
  /** UUID8 prefix included in every log entry. Optional. */
  uuid8?: string;
  /** Override the default stderr write for tests. */
  write?: (line: string) => void;
}

const utcNowIso = (): string => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

class LoggerImpl implements Logger {
  constructor(
    private readonly config: LoggerConfig,
    private readonly phase?: string,
  ) {}

  info(message: string, meta?: Record<string, unknown>): void {
    this.emit({ level: "info", message, ...(meta !== undefined && { meta }) });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.emit({ level: "warn", message, ...(meta !== undefined && { meta }) });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.emit({ level: "error", message, ...(meta !== undefined && { meta }) });
  }

  withPhase(phase: string): Logger {
    return new LoggerImpl(this.config, phase);
  }

  private emit(partial: Omit<LogEntry, "timestamp" | "phase" | "uuid8">): void {
    const entry: LogEntry = {
      ...partial,
      ...(this.phase !== undefined && { phase: this.phase }),
      ...(this.config.uuid8 !== undefined && { uuid8: this.config.uuid8 }),
      timestamp: utcNowIso(),
    };
    const format = this.config.format ?? (process.stderr.isTTY ? "pretty" : "json");
    const line = format === "pretty" ? formatPretty(entry) : JSON.stringify(entry);
    const write = this.config.write ?? ((l: string) => process.stderr.write(`${l}\n`));
    write(line);
  }
}

function formatPretty(entry: LogEntry): string {
  const tag = entry.phase !== undefined ? `[Phase ${entry.phase}]` : "";
  const lvl = entry.level === "info" ? "" : ` ${entry.level.toUpperCase()}:`;
  let line = `${entry.timestamp} ${tag}${lvl} ${entry.message}`;
  if (entry.meta !== undefined && Object.keys(entry.meta).length > 0) {
    line += ` ${JSON.stringify(entry.meta)}`;
  }
  return line;
}

export function createLogger(config: LoggerConfig = {}): Logger {
  return new LoggerImpl(config);
}
