/**
 * ============================================================================
 * CALENDAR COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * Displays a monthly calendar view with interactive date selection.
 * Shows visual indicators for dates that have notes.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Displays current month in calendar grid format
 * 2. Highlights today's date
 * 3. Shows yellow highlight and dot for dates with notes
 * 4. Highlights selected date
 * 5. User can navigate between months
 * 6. Clicking a date calls onDateSelect callback
 * 
 * FEATURES:
 * --------
 * - Month navigation (previous/next)
 * - Today highlighting
 * - Note indicators (yellow background + dot)
 * - Selected date highlighting
 * - Responsive grid layout
 * 
 * DATE FORMATTING:
 * ---------------
 * - Internal format: YYYY-MM-DD (e.g., "2024-01-15")
 * - Display format: Full date string (e.g., "Monday, January 15, 2024")
 * - Uses local timezone to avoid date shifting issues
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the first day of week?
 * A: Modify weekDays array order and firstDayOfMonth calculation
 * 
 * Q: How do I add event indicators?
 * A: Add hasEvent function similar to hasNote and add styling
 * 
 * Q: How do I change the date format?
 * A: Modify formatDateString function
 * 
 * Q: How do I add multi-month view?
 * A: Create wrapper component that renders multiple Calendar instances
 * 
 * ============================================================================
 */

import { useState } from 'react'

/**
 * CALENDAR COMPONENT
 * ------------------
 * Props:
 *   - selectedDate: Currently selected date (YYYY-MM-DD) or null
 *   - onDateSelect: Callback function called when user clicks a date
 *   - notes: Array of note objects with date property
 */
function Calendar({ selectedDate, onDateSelect, notes = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  /**
   * DATE FORMATTING FUNCTION
   * ------------------------
   * Converts day number to YYYY-MM-DD format string.
   * 
   * WHY LOCAL DATE?
   * - Uses local timezone to avoid date shifting
   * - Prevents issues when user is in different timezone than server
   * - Ensures date matches what user sees in calendar
   */
  const formatDateString = (day) => {
    // Use local date formatting to avoid timezone issues
    const date = new Date(year, month, day)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const hasNote = (day) => {
    const dateStr = formatDateString(day)
    return notes.some((note) => note.date === dateStr && note.content && note.content.trim())
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    const dateStr = formatDateString(day)
    return dateStr === selectedDate
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button type="button" onClick={goToPreviousMonth} className="calendar-nav">
          ‹
        </button>
        <h2>
          {monthNames[month]} {year}
        </h2>
        <button type="button" onClick={goToNextMonth} className="calendar-nav">
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dateStr = formatDateString(day)
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${hasNote(day) ? 'has-note' : ''}`}
              onClick={() => onDateSelect(dateStr)}
            >
              {day}
              {hasNote(day) && <span className="note-indicator">•</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

