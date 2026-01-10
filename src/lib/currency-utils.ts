/**
 * Currency formatting utilities
 * Ensures consistent 2 decimal place formatting for all monetary amounts
 */

/**
 * Format currency amount with 2 decimal places
 * @param amount - The amount to format
 * @returns Formatted string with 2 decimal places (e.g., "1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Calculate tax with 2 decimal precision
 * @param taxableAmount - The amount to calculate tax on (subtotal + shipping)
 * @param taxRate - The tax rate (default: 0.0975 for 9.75%)
 * @returns Tax amount with 2 decimal places
 */
export const calculateTax = (
  taxableAmount: number,
  taxRate: number = 0.0975,
): number => {
  return parseFloat((taxableAmount * taxRate).toFixed(2));
};

