// Production-ready logging system

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      return `[${entry.level.toUpperCase()}] ${entry.message}`;
    }
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    // In production, send to logging service (e.g., Sentry, LogRocket, DataDog)
    if (!this.isDevelopment && level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Integrate with external logging service
    // Example: Sentry.captureException(entry);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  // Specialized logging methods
  apiRequest(method: string, path: string, userId?: string) {
    this.info(`API Request: ${method} ${path}`, { method, path, userId });
  }

  apiResponse(method: string, path: string, status: number, duration: number) {
    this.info(`API Response: ${method} ${path} - ${status}`, { 
      method, 
      path, 
      status, 
      duration 
    });
  }

  authEvent(event: string, userId?: string, success: boolean = true) {
    this.info(`Auth Event: ${event}`, { event, userId, success });
  }

  securityEvent(event: string, details: Record<string, any>) {
    this.warn(`Security Event: ${event}`, details);
  }

  performanceMetric(metric: string, value: number, unit: string = 'ms') {
    this.debug(`Performance: ${metric} = ${value}${unit}`, { metric, value, unit });
  }
}

export const logger = new Logger();
