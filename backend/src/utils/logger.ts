/**
 * Minimal logger that never prints Authorization headers, tokens, or passwords.
 */
const SENSITIVE_KEY = /(password|token|authorization|api[_-]?key|secret|cookie)/i;

function redact(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'string') {
    if (value.startsWith('Bearer ') || value.length > 200) return '[redacted]';
    return value;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? '[redacted]' : redact(v);
    }
    return out;
  }
  return value;
}

export const logger = {
  info(message: string, meta?: unknown) {
    if (meta !== undefined) {
      console.log(message, redact(meta));
    } else {
      console.log(message);
    }
  },
  warn(message: string, meta?: unknown) {
    if (meta !== undefined) {
      console.warn(message, redact(meta));
    } else {
      console.warn(message);
    }
  },
  error(message: string, meta?: unknown) {
    if (meta !== undefined) {
      console.error(message, redact(meta));
    } else {
      console.error(message);
    }
  },
};
