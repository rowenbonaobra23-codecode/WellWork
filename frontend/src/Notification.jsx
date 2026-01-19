/**
 * ============================================================================
 * NOTIFICATION COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * Displays temporary notification messages that auto-dismiss after 5 seconds.
 * Used for wellness tips, task reminders, and other alerts.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Shows notification when isVisible is true
 * 2. Auto-closes after 5 seconds
 * 3. User can manually close with X button
 * 4. Cleans up timer on unmount or when hidden
 * 
 * FEATURES:
 * --------
 * - Auto-dismiss after 5 seconds
 * - Manual close button
 * - Smooth animations (handled by CSS)
 * - Prevents memory leaks with cleanup
 * 
 * USAGE:
 * -----
 * <Notification 
 *   isVisible={showNotification} 
 *   message="Your message here"
 *   onClose={() => setShowNotification(false)} 
 * />
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the auto-dismiss time?
 * A: Modify the setTimeout delay (currently 5000ms = 5 seconds)
 * 
 * Q: How do I add different notification types (success/error)?
 * A: Add type prop and apply different CSS classes based on type
 * 
 * Q: How do I make notifications stack?
 * A: Use a notification manager library or create a queue system
 * 
 * ============================================================================
 */

import { useEffect } from 'react'

/**
 * NOTIFICATION COMPONENT
 * ----------------------
 * Props:
 *   - isVisible: Boolean controlling visibility
 *   - message: Text to display in notification
 *   - onClose: Callback function called when notification closes
 */
function Notification({ isVisible, message, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="notification-container">
      <div className="notification-content">
        <p>{message}</p>
        <button type="button" className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default Notification
