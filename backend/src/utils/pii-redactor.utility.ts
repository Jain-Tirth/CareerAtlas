/**
 * Utility for sanitizing and redacting Personally Identifiable Information (PII)
 * before sending resume text or candidate data to external AI APIs (OpenRouter LLMs, Qdrant Vector DBs).
 */

export interface PiiRedactionResult {
  redactedText: string;
  hasPii: boolean;
  redactedCount: {
    emails: number;
    phones: number;
    addresses: number;
  };
}

// Regex patterns for detecting common PII types
const EMAIL_REGEX = /[\w.-]+@[\w.-]+\.\w+/g;
const PHONE_REGEX = /\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
const STREET_ADDRESS_REGEX = /\b\d{1,5}\s+([A-Z][a-z]+\s+){1,4}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi;

/**
 * Strips emails, phone numbers, and street addresses from raw text.
 */
export function redactPii(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, (match) => {
      // Avoid redacting short numeric dates or version strings (e.g., 2026-08-23 or v1.5.0)
      if (match.length < 8 || match.includes('/') || /^\d{4}-\d{2}-\d{2}$/.test(match)) {
        return match;
      }
      return '[REDACTED_PHONE]';
    })
    .replace(STREET_ADDRESS_REGEX, '[REDACTED_ADDRESS]');
}

/**
 * Detailed redaction helper returning detection metrics.
 */
export function redactPiiDetailed(text: string): PiiRedactionResult {
  if (!text || typeof text !== 'string') {
    return {
      redactedText: '',
      hasPii: false,
      redactedCount: { emails: 0, phones: 0, addresses: 0 },
    };
  }

  let emailCount = 0;
  let phoneCount = 0;
  let addressCount = 0;

  const redactedText = text
    .replace(EMAIL_REGEX, () => {
      emailCount++;
      return '[REDACTED_EMAIL]';
    })
    .replace(PHONE_REGEX, (match) => {
      if (match.length < 8 || match.includes('/') || /^\d{4}-\d{2}-\d{2}$/.test(match)) {
        return match;
      }
      phoneCount++;
      return '[REDACTED_PHONE]';
    })
    .replace(STREET_ADDRESS_REGEX, () => {
      addressCount++;
      return '[REDACTED_ADDRESS]';
    });

  return {
    redactedText,
    hasPii: emailCount > 0 || phoneCount > 0 || addressCount > 0,
    redactedCount: {
      emails: emailCount,
      phones: phoneCount,
      addresses: addressCount,
    },
  };
}
