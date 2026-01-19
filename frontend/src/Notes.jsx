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
import { notesStorage, syncQueue } from './offlineStorage.js'

/**
 * NOTES COMPONENT
 * ---------------
 * Props:
 *   - selectedDate: Currently selected date (YYYY-MM-DD format) or null
 *   - apiBaseUrl: Backend API base URL
 *   - token: JWT authentication token
 *   - userId: User ID for caching
 *   - isOfflineMode: Whether backend is offline
 *   - onNoteSaved: Callback function called with updated notes array after save/delete
 */
function Notes({ selectedDate, apiBaseUrl, token, userId, isOfflineMode = false, onNoteSaved }) {
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
    
    // Try to load from server first (if online)
    if (!isOfflineMode) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/notes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const notes = await response.json()
          const noteForDate = notes.find((note) => note.date === date)
          if (noteForDate) {
            setContent(noteForDate.content)
            setCurrentNoteId(noteForDate.id)
          } else {
            setContent('')
            setCurrentNoteId(null)
          }
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.log('Backend offline, loading from cache...')
      }
    }
    
    // Fallback to localStorage cache
    try {
      const cachedNotes = notesStorage.load(userId)
      const noteForDate = cachedNotes.find((note) => note.date === date)
      if (noteForDate) {
        setContent(noteForDate.content)
        setCurrentNoteId(noteForDate.id)
      } else {
        setContent('')
        setCurrentNoteId(null)
      }
    } catch (error) {
      console.error('Error loading note from cache:', error)
      setContent('')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * SAVE NOTE HANDLER
   * -----------------
   * Saves note content to backend (if online) or localStorage (if offline).
   * 
   * HOW IT WORKS:
   * - If online: POST request to /api/notes endpoint, syncs with server
   * - If offline: Saves to localStorage and queues for later sync
   * - Updates local state immediately for instant feedback
   * - Notifies parent component
   * 
   * OFFLINE MODE:
   * - Creates temporary note with local ID
   * - Queues operation for sync when backend comes online
   * - User can continue working seamlessly
   */
  const handleSave = async () => {
    if (!selectedDate) return

    setIsSaving(true)
    const noteData = {
      date: selectedDate,
      content: content.trim(),
    }

    // Try to save to server first (if online)
    if (!isOfflineMode) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(noteData),
        })

        if (response.ok) {
          const updatedNotes = await response.json()
          const savedNote = updatedNotes.find((note) => note.date === selectedDate)
          if (savedNote) {
            setCurrentNoteId(savedNote.id)
          }
          // Sync with parent component and cache
          if (onNoteSaved) {
            onNoteSaved(updatedNotes)
          }
          setIsSaving(false)
          return
        }
      } catch (error) {
        console.log('Backend offline, saving to cache...')
      }
    }

    // Offline mode: Save to localStorage and queue for sync
    try {
      const cachedNotes = notesStorage.load(userId)
      const existingIndex = cachedNotes.findIndex((note) => note.date === selectedDate)
      
      const noteToSave = {
        id: currentNoteId || `temp_${Date.now()}`,
        userId: userId,
        date: selectedDate,
        content: content.trim(),
        createdAt: existingIndex >= 0 ? cachedNotes[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        cachedNotes[existingIndex] = noteToSave
      } else {
        cachedNotes.push(noteToSave)
      }

      // Save to localStorage
      notesStorage.save(userId, cachedNotes)
      
      // Update local state
      setCurrentNoteId(noteToSave.id)
      
      // Queue for sync when online
      syncQueue.add({
        method: 'POST',
        url: '/api/notes',
        headers: {},
        body: noteData
      })

      // Notify parent component
      if (onNoteSaved) {
        onNoteSaved(cachedNotes)
      }
    } catch (error) {
      console.error('Error saving note to cache:', error)
      alert('Failed to save note. Please try again.')
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

    // Try to delete from server first (if online)
    if (!isOfflineMode && !currentNoteId.startsWith('temp_')) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/notes/${currentNoteId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const updatedNotes = await response.json()
          setContent('')
          setCurrentNoteId(null)
          if (onNoteSaved) {
            onNoteSaved(updatedNotes)
          }
          setIsDeleting(false)
          return
        }
      } catch (error) {
        console.log('Backend offline, deleting from cache...')
      }
    }

    // Offline mode: Delete from localStorage and queue for sync
    try {
      const cachedNotes = notesStorage.load(userId)
      const filteredNotes = cachedNotes.filter((note) => note.id !== currentNoteId)
      
      // Save to localStorage
      notesStorage.save(userId, filteredNotes)
      
      // Queue delete for sync (only if it's a real note, not temp)
      if (!currentNoteId.startsWith('temp_')) {
        syncQueue.add({
          method: 'DELETE',
          url: `/api/notes/${currentNoteId}`,
          headers: {},
          body: null
        })
      }

      // Update local state
      setContent('')
      setCurrentNoteId(null)
      
      // Notify parent component
      if (onNoteSaved) {
        onNoteSaved(filteredNotes)
      }
    } catch (error) {
      console.error('Error deleting note from cache:', error)
      alert('Failed to delete note. Please try again.')
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
          {isOfflineMode && (
            <div style={{ 
              padding: '8px', 
              marginBottom: '10px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ Offline mode: Changes are saved locally and will sync when backend is online.
            </div>
          )}
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
              {isSaving ? (isOfflineMode ? 'Saving locally...' : 'Saving...') : 'Save Note'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Notes

