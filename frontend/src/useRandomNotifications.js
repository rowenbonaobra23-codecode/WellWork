/**
 * ============================================================================
 * RANDOM NOTIFICATIONS HOOK - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS HOOK DO?
 * -----------------------
 * Manages random wellness notifications that appear periodically.
 * Also handles browser notification permissions and lock screen notifications.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Shows first notification after random delay (10-60 seconds)
 * 2. Schedules subsequent notifications with random intervals
 * 3. Intervals vary: 40% chance 10-60s, 40% chance 1-10min, 20% chance 1-3hrs
 * 4. Shows both in-app notifications and browser notifications (if permitted)
 * 5. Requests browser notification permission when user logs in
 * 
 * FEATURES:
 * --------
 * - Random notification timing (prevents predictability)
 * - Browser notification support (shows even when app is closed)
 * - Notification permission management
 * - Task reminder integration
 * - Auto-cleanup of timers
 * 
 * NOTIFICATION TYPES:
 * -----------------
 * - Random wellness tips (from notifications array)
 * - Task reminders (from useTaskReminders hook)
 * 
 * BROWSER NOTIFICATIONS:
 * ---------------------
 * - Only shown if user grants permission
 * - Appear even when browser tab is not active
 * - Auto-close after 5 seconds
 * - Clicking focuses the browser window
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I add more notification messages?
 * A: Add strings to the notifications array
 * 
 * Q: How do I change notification frequency?
 * A: Modify the getRandomDelay function probabilities and ranges
 * 
 * Q: How do I disable random notifications?
 * A: Don't use this hook, or add a disable flag
 * 
 * Q: How do I test browser notifications?
 * A: Grant permission, then minimize browser window
 * 
 * ============================================================================
 */

import { useEffect, useState, useCallback } from 'react'

/**
 * NOTIFICATION MESSAGES DATABASE
 * ------------------------------
 * Array of wellness tips and reminders.
 * Randomly selected when showing notifications.
 */
const notifications = [
  "💧 Drink water if you're tired!",
  "🌿 Take a deep breath and relax.",
  "☀️ Step outside for some fresh air.",
  "🧘 Take a 5-minute break to stretch.",
  "💪 You're doing great! Keep it up!",
  "🍎 Remember to eat healthy snacks.",
  "👀 Look away from your screen for 20 seconds.",
  "🚶 Stand up and walk around for a bit.",
  "😊 Smile! It releases endorphins.",
  "🎵 Listen to your favorite song.",
  "📚 Read something inspiring.",
  "🌱 Water your plants if you have any.",
  "✨ You deserve a moment of peace.",
  "🎯 Focus on one task at a time.",
  "🌟 Take pride in your progress!",
]

/**
 * RANDOM NOTIFICATIONS HOOK
 * -------------------------
 * Custom React hook that manages notification system.
 * 
 * RETURNS:
 * {
 *   notification: { visible: boolean, message: string },
 *   hideNotification: () => void,
 *   requestNotificationPermission: () => Promise<boolean>,
 *   browserNotificationPermission: 'default' | 'granted' | 'denied',
 *   showTaskReminder: (message: string) => void
 * }
 */
export function useRandomNotifications() {
  /**
   * STATE MANAGEMENT
   * ---------------
   * - notification: Current notification state (visibility + message)
   * - browserNotificationPermission: Browser's notification permission status
   */
  const [notification, setNotification] = useState({ visible: false, message: '' })
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState(() => {
    if ('Notification' in window) {
      return Notification.permission
    }
    return 'default'
  })

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        setBrowserNotificationPermission(permission)
        return permission === 'granted'
      }
      setBrowserNotificationPermission(Notification.permission)
      return Notification.permission === 'granted'
    }
    return false
  }, [])

  const showBrowserNotification = useCallback((message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('WellWork Reminder', {
        body: message,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'wellwork-reminder',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }, [])

  const showRandomNotification = useCallback(() => {
    const randomMessage = notifications[Math.floor(Math.random() * notifications.length)]
    setNotification({ visible: true, message: randomMessage })
    
    // Also show browser notification for lock screen
    if (Notification.permission === 'granted') {
      showBrowserNotification(randomMessage)
    }
  }, [showBrowserNotification])

  const hideNotification = () => {
    setNotification({ visible: false, message: '' })
  }

  /**
   * RANDOM DELAY GENERATOR
   * ----------------------
   * Generates random delays for notification scheduling.
   * 
   * PROBABILITY DISTRIBUTION:
   * - 40% chance: 10-60 seconds (frequent notifications)
   * - 40% chance: 1-10 minutes (moderate notifications)
   * - 20% chance: 1-3 hours (rare notifications)
   * 
   * WHY RANDOM?
   * - Prevents users from predicting when notifications appear
   * - Creates more natural, less annoying experience
   * - Mimics real-world reminder patterns
   */
  const getRandomDelay = useCallback(() => {
    // Randomly choose between seconds, minutes, or hours
    const timeUnit = Math.random()
    
    if (timeUnit < 0.4) {
      // 40% chance: seconds (10-60 seconds)
      return Math.random() * 50000 + 10000 // 10-60 seconds
    } else if (timeUnit < 0.8) {
      // 40% chance: minutes (1-10 minutes)
      return Math.random() * 540000 + 60000 // 1-10 minutes
    } else {
      // 20% chance: hours (1-3 hours)
      return Math.random() * 7200000 + 3600000 // 1-3 hours
    }
  }, [])

  useEffect(() => {
    let timers = []

    const scheduleNextNotification = () => {
      const delay = getRandomDelay()
      const timer = setTimeout(() => {
        showRandomNotification()
        scheduleNextNotification() // Schedule the next one after showing
      }, delay)
      timers.push(timer)
    }

    // Show first notification after a random delay (10-60 seconds)
    const firstDelay = Math.random() * 50000 + 10000
    const firstTimer = setTimeout(() => {
      showRandomNotification()
      scheduleNextNotification() // Start scheduling subsequent notifications
    }, firstDelay)
    timers.push(firstTimer)

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [showRandomNotification, getRandomDelay])

  const showTaskReminder = useCallback((message) => {
    setNotification({ visible: true, message })
    
    // Also show browser notification for lock screen
    if (Notification.permission === 'granted') {
      showBrowserNotification(message)
    }
  }, [showBrowserNotification])

  return {
    notification,
    hideNotification,
    requestNotificationPermission,
    browserNotificationPermission,
    showTaskReminder,
  }
}

