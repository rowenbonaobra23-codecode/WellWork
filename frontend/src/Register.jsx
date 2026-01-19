/**
 * ============================================================================
 * REGISTER COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * Provides a registration form for new users to create accounts.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. User enters desired username and password
 * 2. Form submits to backend /register endpoint
 * 3. Backend validates input (username uniqueness, password length)
 * 4. Backend hashes password and stores user data
 * 5. On success, shows success message and switches to login screen
 * 
 * VALIDATION:
 * ----------
 * - Username: Required, must be unique
 * - Password: Required, minimum 6 characters
 * - Backend handles additional validation
 * 
 * SECURITY:
 * --------
 * - Passwords are hashed using bcrypt on backend
 * - Never stores plain text passwords
 * - Username uniqueness is checked server-side
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I add email validation?
 * A: Add email field to form and validate format, add to backend schema
 * 
 * Q: How do I add password strength requirements?
 * A: Add validation logic in handleSubmit before sending to backend
 * 
 * Q: How do I auto-login after registration?
 * A: Call onAuth callback with credentials after successful registration
 * 
 * ============================================================================
 */

import { useState } from 'react'

/**
 * REGISTER COMPONENT
 * ------------------
 * Props:
 *   - apiBaseUrl: Backend API base URL
 *   - onRegistered: Callback function called with success message after registration
 */
function Register({ apiBaseUrl, onRegistered }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        let errorMessage = 'Unable to register.'
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
      setForm({ username: '', password: '' })
      onRegistered(payload.message)
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
      <label htmlFor="register-username">Username</label>
      <input
        id="register-username"
        name="username"
        type="text"
        placeholder="Dion"
        value={form.username}
        onChange={handleChange}
        required
      />

      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        name="password"
        type="password"
        placeholder="At least 6 characters"
        value={form.password}
        onChange={handleChange}
        required
        minLength={6}
      />

      {feedback ? (
        <p className={`feedback ${feedback.type}`}>{feedback.message}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

export default Register
