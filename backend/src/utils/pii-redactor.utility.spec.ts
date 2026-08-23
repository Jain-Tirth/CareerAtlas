import { redactPii, redactPiiDetailed } from './pii-redactor.utility';

describe('PiiRedactorUtility', () => {
  it('should redact email addresses from text', () => {
    const rawText = 'Candidate contact email is candidate.pro@gmail.com and work email is alex@company.co';
    const result = redactPii(rawText);
    expect(result).not.toContain('candidate.pro@gmail.com');
    expect(result).not.toContain('alex@company.co');
    expect(result).toContain('[REDACTED_EMAIL]');
  });

  it('should redact phone numbers from text', () => {
    const rawText = 'Reach me at +1 555-123-4567 or 9876543210 for inquiries.';
    const result = redactPii(rawText);
    expect(result).not.toContain('555-123-4567');
    expect(result).not.toContain('9876543210');
    expect(result).toContain('[REDACTED_PHONE]');
  });

  it('should not redact ISO dates or version strings', () => {
    const rawText = 'Updated on 2026-08-23 for version v1.5.0';
    const result = redactPii(rawText);
    expect(result).toContain('2026-08-23');
  });

  it('should return detailed redaction counts', () => {
    const rawText = 'Email: user@domain.com, Phone: +1 888 555 1234';
    const detailed = redactPiiDetailed(rawText);
    expect(detailed.hasPii).toBe(true);
    expect(detailed.redactedCount.emails).toBe(1);
    expect(detailed.redactedCount.phones).toBe(1);
  });
});
