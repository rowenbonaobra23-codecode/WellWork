/**
 * ============================================================================
 * MAIN APP COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * This is the root component that manages the entire application state and flow:
 * - Handles user authentication (login/register)
 * - Manages session state (user token and info)
 * - Monitors backend server health
 * - Coordinates all child components (Calendar, Notes, ChatBot)
 * - Handles notifications and task reminders
 * 
 * APPLICATION FLOW:
 * -----------------
 * 1. User starts at registration/login screen
 * 2. After login, user sees dashboard with calendar, notes, and chatbot
 * 3. App checks backend health every 5 seconds
 * 4. App loads user's notes when logged in
 * 5. App shows random wellness notifications periodically
 * 6. App checks for upcoming task reminders every 30 minutes
 * 
 * KEY FEATURES:
 * ------------
 * - Authentication state management
 * - Backend health monitoring
 * - Note synchronization with backend
 * - Notification system integration
 * - Task reminder system
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the backend URL?
 * A: Set VITE_API_URL environment variable or modify the default in useMemo
 * 
 * Q: How do I change the health check interval?
 * A: Modify the setInterval delay (currently 5000ms = 5 seconds)
 * 
 * Q: How do I disable notifications?
 * A: Remove or comment out the useRandomNotifications hook
 * 
 * Q: Where is user data stored?
 * A: User data is stored in backend/user.json (backend handles this)
 * 
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Calendar from './Calendar.jsx'
import Notes from './Notes.jsx'
import Notification from './Notification.jsx'
import ChatBot from './ChatBot.jsx'
import { useRandomNotifications } from './useRandomNotifications.js'
import useTaskReminders from './useTaskReminders.js'
import './App.css'

/**
 * MAIN APP COMPONENT
 * ------------------
 * Root component that orchestrates the entire application.
 */
function App() {
  /**
   * STATE MANAGEMENT
   * ----------------
   * - stage: Current UI stage ('register' or 'login')
   * - session: User session data (null when logged out, contains token/user when logged in)
   * - serverStatus: Backend health status ('checking', 'online', 'offline')
   * - notice: Success/error messages shown to user
   * - selectedDate: Currently selected calendar date (YYYY-MM-DD format)
   * - notes: Array of user's notes loaded from backend
   */
  const [stage, setStage] = useState('register')
  const [session, setSession] = useState(null)
  const [serverStatus, setServerStatus] = useState('checking')
  const [notice, setNotice] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [notes, setNotes] = useState([])
  
  /**
   * CUSTOM HOOKS
   * -----------
   * - useRandomNotifications: Manages wellness notifications
   * - useTaskReminders: Checks for upcoming tasks and generates reminders
   */
  const { notification, hideNotification, requestNotificationPermission, browserNotificationPermission, showTaskReminder } = useRandomNotifications()
  const { checkUpcomingTasks } = useTaskReminders(notes)
  
  /**
   * API BASE URL
   * ------------
   * Gets backend URL from environment variable or defaults to localhost:5000
   * useMemo ensures this is only calculated once
   */
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
    [],
  )

  /**
   * EFFECT: Backend Health Monitoring
   * ---------------------------------
   * Continuously checks if backend server is online.
   * 
   * HOW IT WORKS:
   * - Makes GET request to /health endpoint
   * - Checks immediately on mount
   * - Then checks every 5 seconds
   * - Updates serverStatus state based on response
   * - Cleans up on unmount (aborts requests, clears interval)
   * 
   * WHY ABORT CONTROLLER?
   * - Prevents memory leaks if component unmounts during fetch
   * - Cancels pending requests when component is destroyed
   */
  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      try {
        setServerStatus('checking')
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`)
        }
        await response.json()
        setServerStatus('online')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Health check error:', error)
          setServerStatus('offline')
        }
      }
    }

    // Check immediately and then every 5 seconds
    checkHealth()
    const interval = setInterval(checkHealth, 5000)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [apiBaseUrl])

  /**
   * EFFECT: Load User Notes & Request Notification Permission
   * ---------------------------------------------------------
   * Loads user's notes from backend when they log in.
   * Also requests browser notification permission.
   * 
   * WHEN IT RUNS:
   * - When session changes (user logs in/out)
   * - When apiBaseUrl changes
   * - When browserNotificationPermission changes
   * 
   * PROCESS:
   * 1. If no session token, clears notes
   * 2. If session exists, fetches notes from /api/notes endpoint
   * 3. Updates notes state with fetched data
   * 4. Requests notification permission if not already granted/denied
   */
  useEffect(() => {
    async function loadNotes() {
      if (!session?.token) {
        setNotes([])
        return
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/notes`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        if (response.ok) {
          const userNotes = await response.json()
          setNotes(userNotes)
        }
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }

    loadNotes()

    // Request notification permission when user logs in
    if (session?.token && browserNotificationPermission === 'default') {
      requestNotificationPermission()
    }
  }, [session, apiBaseUrl, browserNotificationPermission, requestNotificationPermission])

  /**
   * EFFECT: Task Reminder System
   * ----------------------------
   * Checks for upcoming tasks and shows reminders.
   * 
   * HOW IT WORKS:
   * - Only runs when user is logged in and has notes
   * - Checks immediately 5 seconds after login
   * - Then checks every 30 minutes
   * - Uses checkUpcomingTasks hook to find tasks due soon
   * - Shows notification if tasks are found
   * 
   * TIMING:
   * - Initial check: 5 seconds after login (gives time for notes to load)
   * - Subsequent checks: Every 30 minutes
   */
  useEffect(() => {
    if (!session?.token || notes.length === 0) return

    // Check for upcoming tasks every 30 minutes
    const checkTasks = () => {
      const reminder = checkUpcomingTasks()
      if (reminder) {
        showTaskReminder(reminder.message)
      }
    }

    // Check immediately
    const initialCheck = setTimeout(checkTasks, 5000) // Wait 5 seconds after login

    // Then check every 30 minutes
    const interval = setInterval(checkTasks, 30 * 60 * 1000) // 30 minutes

    return () => {
      clearTimeout(initialCheck)
      clearInterval(interval)
    }
  }, [session, notes, checkUpcomingTasks, showTaskReminder])

  const healthLabel = {
    checking: 'Checking backend…',
    online: 'Backend is online',
    offline: 'Backend is offline',
  }[serverStatus]

  const stageLabel = stage === 'register' ? 'REGISTER' : 'LOGIN'
  const headerTitle = stage === 'register' ? 'Please register in WellWork' : 'Welcome to WellWork'

  return (
    <div className="app-shell">
      <Notification
        isVisible={session && notification.visible}
        message={notification.message}
        onClose={hideNotification}
      />
      <header className="app-header">
        <h1>{headerTitle}</h1>
        <div className={`status-pill status-${serverStatus}`}>{healthLabel}</div>
      </header>

      <section className="panel">
        {session ? (
          <div className="dashboard-container">
            <div className="dashboard-header">
              <div>
                <p className="session-label">Welcome, <strong>{session.user.username}</strong></p>
                {browserNotificationPermission === 'default' && (
                  <button 
                    type="button" 
                    className="notification-permission-button"
                    onClick={requestNotificationPermission}
                  >
                    Enable Lock Screen Notifications
                  </button>
                )}
                {browserNotificationPermission === 'denied' && (
                  <p className="notification-denied">Notifications blocked. Enable in browser settings.</p>
                )}
              </div>
              <button type="button" className="secondary" onClick={() => {
                setSession(null)
                setSelectedDate(null)
                setNotes([])
              }}>
                Log out
              </button>
            </div>

            <div className="dashboard-content">
              <div className="calendar-section">
                <Calendar 
                  selectedDate={selectedDate} 
                  onDateSelect={setSelectedDate}
                  notes={notes}
                />
              </div>
              <div className="notes-section">
                <Notes
                  selectedDate={selectedDate}
                  apiBaseUrl={apiBaseUrl}
                  token={session.token}
                  onNoteSaved={setNotes}
                />
              </div>
              <div className="chatbot-section">
                <ChatBot notes={notes} checkUpcomingTasks={checkUpcomingTasks} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="stage-header">
              <p className="stage-label">{stageLabel}</p>
              {notice ? <p className="feedback success">{notice}</p> : null}
            </div>

            {stage === 'register' ? (
              <>
                <Register
                  apiBaseUrl={apiBaseUrl}
                  onRegistered={(message) => {
                    setStage('login')
                    setNotice(message)
                  }}
                />
                <p className="stage-switch">
                  Already registered?{' '}
                  <button type="button" className="link-button" onClick={() => setStage('login')}>
                    Go to login
                  </button>
                </p>
              </>
            ) : (
              <>
                <Login
                  apiBaseUrl={apiBaseUrl}
                  onAuth={(payload) => {
                    setSession(payload)
                    setNotice(null)
                  }}
                />
                <p className="stage-switch">
                  Need an account?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setStage('register')
                      setNotice(null)
                    }}
                  >
                    Return to registration
                  </button>
                </p>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default App
