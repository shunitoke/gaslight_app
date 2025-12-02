type TelemetryLevel = 'info' | 'warn' | 'error';

const emit = (level: TelemetryLevel, event: string, data?: Record<string, unknown>) => {
  const payload = {
    level,
    event,
    data,
    timestamp: new Date().toISOString()
  };

  console[level === 'error' ? 'error' : level](JSON.stringify(payload));
};

export const logInfo = (event: string, data?: Record<string, unknown>) =>
  emit('info', event, data);

export const logWarn = (event: string, data?: Record<string, unknown>) =>
  emit('warn', event, data);

export const logError = (event: string, data?: Record<string, unknown>) =>
  emit('error', event, data);

