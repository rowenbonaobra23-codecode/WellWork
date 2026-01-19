/**
 * ============================================================================
 * LOGIN COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * Provides a login form for existing users to authenticate.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. User enters username and password
 * 2. Form submits to backend /login endpoint
 * 3. Backend validates credentials
 * 4. On success, receives JWT token and user info
 * 5. Calls onAuth callback with token and user data
 * 6. Parent component (App.jsx) handles session management
 * 
 * SECURITY:
 * --------
 * - Passwords are hashed on backend (never sent in plain text)
 * - Uses JWT tokens for authentication
 * - Token expires after 1 hour (handled by backend)
 * 
 * ERROR HANDLING:
 * --------------
 * - Shows error if backend is offline
 * - Shows error if credentials are invalid
 * - Shows error if username/password is missing
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the password minimum length?
 * A: Modify minLength attribute (currently 6) and backend validation
 * 
 * Q: How do I add "Remember Me" functionality?
 * A: Store token in localStorage and check on app load
 * 
 * Q: How do I add password reset?
 * A: Add a new endpoint in backend and create a reset component
 * 
 * ============================================================================
 */

import { useState } from 'react'

/**
 * LOGIN COMPONENT
 * ---------------
 * Props:
 *   - apiBaseUrl: Backend API base URL
 *   - onAuth: Callback function called with { token, user } on successful login
 */
function Login({ apiBaseUrl, onAuth }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  /**
   * FORM SUBMISSION HANDLER
   * -----------------------
   * Handles login form submission.
   * 
   * PROCESS:
   * 1. Prevents default form submission
   * 2. Sets loading state
   * 3. Sends POST request to /login endpoint
   * 4. Backend validates credentials
   * 5. On success: receives token and user data, calls onAuth callback
   * 6. On error: displays error message to user
   * 7. Always resets loading state
   * 
   * ERROR HANDLING:
   * - Network errors: Shows connection error message
   * - Server errors: Shows error message from backend
   * - Invalid credentials: Shows "Invalid credentials" message
   */
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        let errorMessage = 'Unable to log in.'
        try {
          const payload = await response.json()
          errorMessage = payload.message || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const payload = await response.json()
      setFeedback(null)
      // Call parent callback with authentication data
      onAuth({ token: payload.token, user: payload.user })
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setFeedback({ type: 'error', message: 'Cannot connect to server. Make sure the backend is running on http://localhost:5000' })
      } else {
        setFeedback({ type: 'error', message: error.message || 'An error occurred. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="login-username">Username</label>
      <input
        id="login-username"
        name="username"
        type="text"
        placeholder="Your username"
        value={form.username}
        onChange={handleChange}
        required
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={form.password}
        onChange={handleChange}
        required
        minLength={6}
      />

      {feedback ? (
        <p className={`feedback ${feedback.type}`}>{feedback.message}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default Login
