/**
 * ============================================================================
 * TASK REMINDERS HOOK - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS HOOK DO?
 * -----------------------
 * Monitors user's notes and generates reminders for upcoming tasks.
 * Prevents duplicate reminders for the same task on the same day.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Checks notes for tasks due today, tomorrow, or day after tomorrow
 * 2. Finds the most urgent (closest date) task
 * 3. Generates reminder message with appropriate emoji
 * 4. Marks reminder as shown (prevents duplicates)
 * 5. Resets shown reminders daily at midnight
 * 
 * REMINDER LOGIC:
 * --------------
 * - Today: ⚠️ "Task due TODAY"
 * - Tomorrow: ⏰ "Task due TOMORROW"
 * - Day after: 📅 "Task due in 2 days"
 * - Only shows one reminder at a time (most urgent)
 * - Each task can only be reminded once per day
 * 
 * DUPLICATE PREVENTION:
 * --------------------
 * - Uses Set to track shown reminders
 * - Key format: "{noteId}-{date}"
 * - Resets daily at midnight
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the reminder window (currently 2 days)?
 * A: Modify dayAfterTomorrow calculation and filter logic
 * 
 * Q: How do I show multiple reminders?
 * A: Return array of reminders instead of single reminder
 * 
 * Q: How do I change reminder timing?
 * A: Modify the reset interval check (currently checks every minute)
 * 
 * Q: How do I add custom reminder messages?
 * A: Modify the message generation logic based on note properties
 * 
 * ============================================================================
 */

import { useEffect, useState, useCallback } from 'react'

/**
 * TASK REMINDERS HOOK
 * -------------------
 * Custom React hook that checks for upcoming tasks and generates reminders.
 * 
 * PARAMETERS:
 *   - notes: Array of note objects with date and content properties
 * 
 * RETURNS:
 * {
 *   checkUpcomingTasks: () => { message: string, noteId: string, date: string } | null
 * }
 */
function useTaskReminders(notes = []) {
  const [reminderShown, setReminderShown] = useState(new Set())

  /**
   * CHECK UPCOMING TASKS FUNCTION
   * ----------------------------
   * Analyzes notes and returns reminder for most urgent upcoming task.
   * 
   * PROCESS:
   * 1. Filters notes due in next 2 days
   * 2. Excludes notes already reminded today
   * 3. Sorts by date (closest first)
   * 4. Generates reminder message for most urgent
   * 5. Marks reminder as shown
   * 6. Returns reminder object or null
   * 
   * RETURN FORMAT:
   * { message: string, noteId: string, date: string } | null
   */
  const checkUpcomingTasks = useCallback(() => {
    if (!notes || notes.length === 0) return null

    // Set up date boundaries (today, tomorrow, day after)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    // Find notes that are due today or in the next 2 days
    const upcomingNotes = notes.filter((note) => {
      if (!note.date || !note.content) return false

      const noteDate = new Date(note.date + 'T00:00:00')
      noteDate.setHours(0, 0, 0, 0)

      const isToday = noteDate.getTime() === today.getTime()
      const isTomorrow = noteDate.getTime() === tomorrow.getTime()
      const isDayAfter = noteDate.getTime() === dayAfterTomorrow.getTime()

      // Check if we've already shown a reminder for this note today
      const reminderKey = `${note.id}-${today.toISOString().split('T')[0]}`
      if (reminderShown.has(reminderKey)) {
        return false
      }

      return isToday || isTomorrow || isDayAfter
    })

    if (upcomingNotes.length === 0) return null

    // Get the most urgent (closest date) note
    const urgentNote = upcomingNotes.sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00')
      const dateB = new Date(b.date + 'T00:00:00')
      return dateA - dateB
    })[0]

    const noteDate = new Date(urgentNote.date + 'T00:00:00')
    noteDate.setHours(0, 0, 0, 0)
    
    const daysUntil = Math.ceil((noteDate - today) / (1000 * 60 * 60 * 24))
    
    // Generate appropriate message based on urgency
    let message = ''
    let emoji = '📅'

    if (daysUntil === 0) {
      emoji = '⚠️'
      message = `🔔 Task due TODAY: "${urgentNote.content.substring(0, 50)}${urgentNote.content.length > 50 ? '...' : ''}"`
    } else if (daysUntil === 1) {
      emoji = '⏰'
      message = `🔔 Task due TOMORROW: "${urgentNote.content.substring(0, 50)}${urgentNote.content.length > 50 ? '...' : ''}"`
    } else {
      message = `🔔 Task due in ${daysUntil} days: "${urgentNote.content.substring(0, 50)}${urgentNote.content.length > 50 ? '...' : ''}"`
    }

    // Mark this reminder as shown (prevents duplicate reminders)
    const reminderKey = `${urgentNote.id}-${today.toISOString().split('T')[0]}`
    setReminderShown((prev) => new Set(prev).add(reminderKey))

    return { message: `${emoji} ${message}`, noteId: urgentNote.id, date: urgentNote.date }
  }, [notes, reminderShown])

  /**
   * EFFECT: Daily Reminder Reset
   * ---------------------------
   * Resets the reminder tracking set at midnight each day.
   * 
   * WHY?
   * - Allows same task to be reminded again the next day
   * - Prevents stale reminders from persisting
   * 
   * HOW:
   * - Checks every minute if current time is midnight
   * - Clears reminderShown set when midnight detected
   * - Cleans up interval on unmount
   */
  useEffect(() => {
    const resetInterval = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setReminderShown(new Set())
      }
    }, 60000) // Check every minute

    return () => clearInterval(resetInterval)
  }, [])

  return { checkUpcomingTasks }
}

export default useTaskReminders








