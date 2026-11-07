/**
 * Date and formatting utilities for HealthPulse Hospital Management System
 */

/**
 * Format a consultation date cleanly (e.g., "Sat, 31 Oct 2026").
 * Prevents long raw timestamp or GMT strings from overflowing UI cards.
 *
 * @param {string|Date|number} dateVal
 * @returns {string} Formatted date string or empty string
 */
export function formatConsultationDate(dateVal) {
  if (!dateVal) return ''

  try {
    // If dateVal is already in "Sat, 31 Oct 2026" short format, return trimmed
    if (
      typeof dateVal === 'string' &&
      /^[A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateVal.trim())
    ) {
      return dateVal.trim()
    }

    let d

    // Handle plain YYYY-MM-DD safely without UTC day-shift
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      const [year, month, day] = dateVal.trim().split('-').map(Number)
      d = new Date(year, month - 1, day)
    } else {
      d = new Date(dateVal)
    }

    if (isNaN(d.getTime())) {
      // Fallback if parsing fails
      return String(dateVal)
    }

    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (err) {
    console.error('Error formatting consultation date:', err)
    return String(dateVal || '')
  }
}

/**
 * Format doctor name ensuring no duplicate "Dr." prefix.
 *
 * @param {string} name
 * @returns {string} Formatted doctor name (e.g., "Dr. Karthik")
 */
export function formatDoctorName(name) {
  if (!name) return 'Assigned Physician'
  const trimmed = name.trim()
  if (trimmed.startsWith('Dr.') || trimmed.startsWith('Dr ')) {
    return trimmed
  }
  return `Dr. ${trimmed}`
}
