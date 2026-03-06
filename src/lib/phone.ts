import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Normalizes a phone number to E.164 format.
 * If the number is already in E.164 format, it returns it as is.
 * If it's a local number (e.g., 9 digits for Portugal), it adds the default country code.
 */
export function normalizeToE164(phone: string, defaultCountry: any = 'PT'): string {
  // Remove spaces and non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    try {
      const parsed = parsePhoneNumber(cleaned);
      return parsed.format('E.164');
    } catch (e) {
      return cleaned;
    }
  }

  // If it's just digits, try to parse with default country
  try {
    const parsed = parsePhoneNumber(cleaned, defaultCountry);
    if (parsed) {
      return parsed.format('E.164');
    }
  } catch (e) {
    // Fallback for simple cases if libphonenumber fails
    if (cleaned.length === 9 && defaultCountry === 'PT') {
      return `+351${cleaned}`;
    }
    if (cleaned.startsWith('351') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
  }

  return cleaned;
}

export function validatePhone(phone: string): boolean {
  return isValidPhoneNumber(phone);
}
