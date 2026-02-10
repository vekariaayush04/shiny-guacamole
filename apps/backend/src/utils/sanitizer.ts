export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\0/g, '')
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\s*on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    .replace(/javascript:[^\s]*/gi, '')
    .replace(/data:[^\s]*/gi, '')
    .replace(/\s+/g, ' ')
    .slice(0, 10000);
}

export interface SanitizedMessage {
  content: string;
  isValid: boolean;
  originalLength: number;
  sanitizedLength: number;
}

export function sanitizeMessage(input: string): SanitizedMessage {
  const originalLength = input.length;
  const content = sanitizeString(input);
  const sanitizedLength = content.length;

  return {
    content,
    isValid: content.length > 0 && content.length <= 10000,
    originalLength,
    sanitizedLength,
  };
}

export function extractEntities(input: string): {
  emails: string[];
  orderNumbers: string[];
  phoneNumbers: string[];
} {
  const emails = input.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
  const orderNumbers = input.match(/(?:order|ord|#)[\s:-]?([A-Z0-9-]{5,})/gi) || [];
  const phoneNumbers = input.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,6}/g) || [];

  return { emails, orderNumbers, phoneNumbers };
}
