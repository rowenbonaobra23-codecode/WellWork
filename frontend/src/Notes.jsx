/**
 * ============================================================================
 * NOTES COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * Allows users to create, edit, and delete notes for specific calendar dates.
 * 
 * HOW IT WORKS:
 * ------------
 * 1. User selects a date in the calendar
 * 2. Component loads existing note for that date (if any)
 * 3. User can type/edit note content in textarea
 * 4. Clicking "Save Note" saves to backend
 * 5. Clicking "Delete Note" removes note from backend
 * 6. Changes are synced with parent component
 * 
 * FEATURES:
 * --------
 * - Auto-loads note when date is selected
 * - Creates new note or updates existing one
 * - Delete confirmation dialog
 * - Loading states during API calls
 * - Error handling for network issues
 * 
 * DATA FLOW:
 * ---------
 * - Reads: Fetches notes from GET /api/notes
 * - Creates/Updates: POST /api/notes (if date exists, updates; otherwise creates)
 * - Deletes: DELETE /api/notes/:id
 * - Syncs: Calls onNoteSaved callback to update parent state
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I add rich text editing?
 * A: Replace textarea with a rich text editor library (e.g., Quill, TinyMCE)
 * 
 * Q: How do I add note categories/tags?
 * A: Add category field to note object and filter UI in parent component
 * 
 * Q: How do I add note search functionality?
 * A: Add search input and filter notes array before displaying
 * 
 * Q: How do I change the date format?
 * A: Modify formatDateDisplay function
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react'

/**
 * NOTES COMPONENT
 * ---------------
 * Props:
 *   - selectedDate: Currently selected date (YYYY-MM-DD format) or null
 *   - apiBaseUrl: Backend API base URL
 *   - token: JWT authentication token
 *   - onNoteSaved: Callback function called with updated notes array after save/delete
 */
function Notes({ selectedDate, apiBaseUrl, token, onNoteSaved }) {
  const [content, setContent] = useState('')
  const [currentNoteId, setCurrentNoteId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * EFFECT: Load Note When Date Changes
   * -----------------------------------
   * Automatically loads note content when user selects a different date.
   * 
   * WHEN IT RUNS:
   * - When selectedDate prop changes
   * - On component mount if date is already selected
   * 
   * PROCESS:
   * - If date selected: Fetches note from backend
   * - If no date selected: Clears content
   */
  useEffect(() => {
    if (selectedDate) {
      loadNoteForDate(selectedDate)
    } else {
      setContent('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const loadNoteForDate = async (date) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.status}`)
      }

      const notes = await response.json()
      const noteForDate = notes.find((note) => note.date === date)
      if (noteForDate) {
        setContent(noteForDate.content)
        setCurrentNoteId(noteForDate.id)
      } else {
        setContent('')
        setCurrentNoteId(null)
      }
    } catch (error) {
      console.error('Error loading note:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Make sure the backend is running.')
      }
      setContent('')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * SAVE NOTE HANDLER
   * -----------------
   * Saves note content to backend.
   * 
   * HOW IT WORKS:
   * - POST request to /api/notes endpoint
   * - Backend checks if note exists for this date
   * - If exists: Updates existing note
   * - If not exists: Creates new note
   * - Returns all user's notes
   * - Updates local state and notifies parent component
   * 
   * NOTE: Backend handles create vs update logic automatically
   */
  const handleSave = async () => {
    if (!selectedDate) return

    setIsSaving(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save note: ${response.status}`)
      }

      const updatedNotes = await response.json()
      const savedNote = updatedNotes.find((note) => note.date === selectedDate)
      if (savedNote) {
        setCurrentNoteId(savedNote.id)
      }
      // Sync with parent component
      if (onNoteSaved) {
        onNoteSaved(updatedNotes)
      }
    } catch (error) {
      console.error('Error saving note:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Make sure the backend is running on http://localhost:5000')
      } else {
        alert(`Failed to save note: ${error.message}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDate || !currentNoteId) return

    if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/notes/${currentNoteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`)
      }

      const updatedNotes = await response.json()
      setContent('')
      setCurrentNoteId(null)
      if (onNoteSaved) {
        onNoteSaved(updatedNotes)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Make sure the backend is running on http://localhost:5000')
      } else {
        alert(`Failed to delete note: ${error.message}`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select a date'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!selectedDate) {
    return (
      <div className="notes-container">
        <div className="notes-placeholder">
          <p>Select a date on the calendar to add or edit notes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h3>{formatDateDisplay(selectedDate)}</h3>
      </div>

      {isLoading ? (
        <div className="notes-loading">Loading note...</div>
      ) : (
        <>
          <textarea
            className="notes-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            rows={10}
          />

          <div className="notes-actions">
            {currentNoteId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="notes-delete-button"
              >
                {isDeleting ? 'Deleting...' : 'Delete Note'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="notes-save-button"
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Notes

