/**
 * ============================================================================
 * OFFLINE STORAGE UTILITY - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS UTILITY DO?
 * ---------------------------
 * Provides offline-first functionality using browser localStorage:
 * - Caches notes locally for offline access
 * - Caches user session for offline login persistence
 * - Queues failed API requests for retry when online
 * - Automatically syncs when backend comes back online
 * 
 * HOW IT WORKS:
 * ------------
 * 1. All data operations check localStorage first
 * 2. If backend is online, syncs with server
 * 3. If backend is offline, uses cached data
 * 4. Failed requests are queued and retried when online
 * 
 * STORAGE KEYS:
 * ------------
 * - 'wellwork_notes_{userId}': User's notes cache
 * - 'wellwork_session': User session cache
 * - 'wellwork_sync_queue': Queue of pending operations
 * 
 * ============================================================================
 */

const STORAGE_PREFIX = 'wellwork_'

/**
 * Get storage key for user-specific data
 */
function getUserKey(userId, key) {
  return `${STORAGE_PREFIX}${key}_${userId}`
}

/**
 * NOTES STORAGE
 * -------------
 * Functions to save/load notes from localStorage
 */
export const notesStorage = {
  /**
   * Save notes to localStorage
   */
  save: (userId, notes) => {
    try {
      const key = getUserKey(userId, 'notes')
      localStorage.setItem(key, JSON.stringify(notes))
      return true
    } catch (error) {
      console.error('Error saving notes to localStorage:', error)
      return false
    }
  },

  /**
   * Load notes from localStorage
   */
  load: (userId) => {
    try {
      const key = getUserKey(userId, 'notes')
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading notes from localStorage:', error)
      return []
    }
  },

  /**
   * Clear notes from localStorage
   */
  clear: (userId) => {
    try {
      const key = getUserKey(userId, 'notes')
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error clearing notes from localStorage:', error)
    }
  }
}

/**
 * SESSION STORAGE
 * --------------
 * Functions to save/load user session from localStorage
 */
export const sessionStorage = {
  /**
   * Save session to localStorage
   */
  save: (session) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}session`, JSON.stringify(session))
      return true
    } catch (error) {
      console.error('Error saving session to localStorage:', error)
      return false
    }
  },

  /**
   * Load session from localStorage
   */
  load: () => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}session`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error loading session from localStorage:', error)
      return null
    }
  },

  /**
   * Clear session from localStorage
   */
  clear: () => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}session`)
    } catch (error) {
      console.error('Error clearing session from localStorage:', error)
    }
  }
}

/**
 * SYNC QUEUE
 * ----------
 * Queue system for failed API requests that need retry
 */
export const syncQueue = {
  /**
   * Add operation to sync queue
   */
  add: (operation) => {
    try {
      const queue = syncQueue.getAll()
      queue.push({
        ...operation,
        timestamp: Date.now(),
        retries: 0
      })
      localStorage.setItem(`${STORAGE_PREFIX}sync_queue`, JSON.stringify(queue))
      return true
    } catch (error) {
      console.error('Error adding to sync queue:', error)
      return false
    }
  },

  /**
   * Get all queued operations
   */
  getAll: () => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}sync_queue`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading sync queue:', error)
      return []
    }
  },

  /**
   * Remove operation from queue
   */
  remove: (index) => {
    try {
      const queue = syncQueue.getAll()
      queue.splice(index, 1)
      localStorage.setItem(`${STORAGE_PREFIX}sync_queue`, JSON.stringify(queue))
      return true
    } catch (error) {
      console.error('Error removing from sync queue:', error)
      return false
    }
  },

  /**
   * Clear entire sync queue
   */
  clear: () => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}sync_queue`)
    } catch (error) {
      console.error('Error clearing sync queue:', error)
    }
  }
}

/**
 * RETRY FAILED REQUESTS
 * ---------------------
 * Attempts to retry all queued operations when backend comes online
 */
export async function retryFailedRequests(apiBaseUrl, token) {
  const queue = syncQueue.getAll()
  if (queue.length === 0) return

  console.log(`Retrying ${queue.length} queued operations...`)

  for (let i = queue.length - 1; i >= 0; i--) {
    const operation = queue[i]
    
    try {
      const response = await fetch(`${apiBaseUrl}${operation.url}`, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...operation.headers
        },
        body: operation.body ? JSON.stringify(operation.body) : undefined
      })

      if (response.ok) {
        // Success - remove from queue
        syncQueue.remove(i)
        console.log(`Successfully synced: ${operation.method} ${operation.url}`)
      } else {
        // Still failing - increment retries
        operation.retries++
        if (operation.retries > 5) {
          // Too many retries - remove from queue
          syncQueue.remove(i)
          console.warn(`Gave up on: ${operation.method} ${operation.url}`)
        }
      }
    } catch (error) {
      // Network error - keep in queue
      operation.retries++
      if (operation.retries > 5) {
        syncQueue.remove(i)
        console.warn(`Gave up on: ${operation.method} ${operation.url}`)
      }
    }
  }

  // Update queue with new retry counts
  const updatedQueue = syncQueue.getAll()
  localStorage.setItem(`${STORAGE_PREFIX}sync_queue`, JSON.stringify(updatedQueue))
}

