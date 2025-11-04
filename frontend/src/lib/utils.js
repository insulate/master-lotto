/**
 * Utility function to merge Tailwind CSS classes
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format number to Thai currency format
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export function formatCurrency(number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(number);
}

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(number) {
  return new Intl.NumberFormat('th-TH').format(number);
}

/**
 * Format date to Thai format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date and time to Thai format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
