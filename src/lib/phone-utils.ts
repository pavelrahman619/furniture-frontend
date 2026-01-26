/**
 * Phone number formatting utilities
 * Formats phone numbers as (123) 456-7890 with +1 prefix
 */

/**
 * Format phone number to (123) 456-7890 format
 * @param value - The phone number string (digits only)
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Format as (123) 456-7890
  if (limitedDigits.length === 0) {
    return "";
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
};

/**
 * Extract digits from formatted phone number
 * @param formattedPhone - The formatted phone number string
 * @returns Digits only string (max 10 digits)
 */
export const extractPhoneDigits = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, "").slice(0, 10);
};

/**
 * Validate phone number has exactly 10 digits
 * @param phone - The phone number string (formatted or unformatted)
 * @returns true if phone has exactly 10 digits
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
};
