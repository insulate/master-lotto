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
 * Format date to Thai format (Asia/Bangkok timezone)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '-';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    }).format(dateObj);
  } catch (error) {
    return '-';
  }
}

/**
 * Format date and time to Thai format (Asia/Bangkok timezone)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
  if (!date) return '-';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(dateObj);
  } catch (error) {
    return '-';
  }
}

/**
 * Get status badge color classes
 * @param {string} status - Status value (active/suspended)
 * @returns {string} Tailwind CSS color classes
 */
export function getStatusColor(status) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/50',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  };
  return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
}

/**
 * Get status label in Thai
 * @param {string} status - Status value
 * @returns {string} Thai status label
 */
export function getStatusLabel(status) {
  const statusLabels = {
    active: 'ใช้งาน',
    suspended: 'ระงับ',
    pending: 'รอดำเนินการ',
  };
  return statusLabels[status] || status;
}

/**
 * Validate username format (alphanumeric only, 3-20 characters)
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
export function isValidUsername(username) {
  if (!username) return false;
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(username);
}

/**
 * Validate password strength (minimum 6 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Parse API error message
 * @param {Error} error - Error object from API
 * @returns {string} User-friendly error message
 */
export function parseErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}
