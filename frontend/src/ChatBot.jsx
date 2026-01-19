/**
 * ============================================================================
 * CHATBOT COMPONENT - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS COMPONENT DO?
 * -----------------------------
 * This is an interactive chatbot assistant that helps users with:
 * - Calendar and notes management guidance
 * - Wellness tips and health advice
 * - Productivity suggestions
 * - Task reminders and upcoming deadlines
 * 
 * HOW DOES IT WORK?
 * -----------------
 * 1. Users type messages in the input field
 * 2. The chatbot analyzes keywords in the message
 * 3. It responds with relevant pre-defined answers based on the topic
 * 4. Messages are displayed in a chat-like interface
 * 5. The chat auto-scrolls to show the latest messages
 * 
 * KEY FEATURES:
 * ------------
 * - Pattern matching: Recognizes keywords like "calendar", "tips", "help"
 * - Random responses: Selects random answers from arrays for variety
 * - Note integration: Can tell users how many notes they have
 * - Task reminders: Shows upcoming tasks when asked
 * - Loading states: Shows typing indicator while "thinking"
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I add new response categories?
 * A: Add a new key to chatbotResponses object and add a matching condition in getResponse()
 * 
 * Q: How do I change the typing delay?
 * A: Modify the setTimeout delay in handleSubmit (currently 500ms)
 * 
 * Q: Can I connect this to a real AI API?
 * A: Yes! Replace getResponse() logic with an API call to OpenAI, Claude, etc.
 * 
 * Q: How does it detect upcoming tasks?
 * A: It uses the checkUpcomingTasks prop function passed from App.jsx
 * 
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react'

/**
 * RESPONSE DATABASE
 * ----------------
 * Pre-defined responses organized by category.
 * Each category has multiple responses that are randomly selected.
 * This creates variety in the chatbot's answers.
 */
const chatbotResponses = {
  greeting: [
    "Hello! I'm your WellWork assistant. How can I help you today?",
    "Hi there! I'm here to help with your calendar and wellness tips. What would you like to know?",
    "Welcome! I can help you manage your calendar, give wellness tips, or answer questions. What can I do for you?",
  ],
  help: [
    "I can help you with:\n• Managing your calendar and notes\n• Wellness tips and reminders\n• Productivity advice\n• Time management suggestions\n\nWhat would you like help with?",
  ],
  calendar: [
    "To add a note to a date, simply click on any date in the calendar and type your note in the text area. Click 'Save Note' when you're done!",
    "You can see which dates have notes by looking for the yellow highlight and dot indicator on calendar dates.",
    "To delete a note, select the date, then click the 'Delete Note' button.",
  ],
  tips: [
    "💧 Stay hydrated! Drink water regularly throughout the day.",
    "🧘 Take breaks every hour to stretch and relax your eyes.",
    "📝 Write down your tasks to stay organized and reduce stress.",
    "🌿 Spend time outdoors for fresh air and vitamin D.",
    "😊 Practice gratitude - write down three things you're thankful for each day.",
    "⏰ Use the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.",
    "📱 Limit screen time before bed for better sleep.",
    "🏃 Regular exercise boosts mood and energy levels.",
    "🍎 Eat balanced meals to maintain steady energy.",
    "🎯 Set small, achievable goals each day.",
  ],
  productivity: [
    "Start your day by planning your top 3 priorities. Focus on completing these first.",
    "Break large tasks into smaller, manageable steps. This makes them less overwhelming.",
    "Use the calendar to schedule important tasks and deadlines.",
    "Eliminate distractions by creating a dedicated workspace.",
    "Take regular breaks - your brain needs rest to maintain focus.",
    "Review your notes at the end of each day to prepare for tomorrow.",
  ],
  default: [
    "I'm not sure I understand. Could you try asking about:\n• Calendar and notes\n• Wellness tips\n• Productivity advice\n• Or type 'help' for more options!",
    "Let me help you better! You can ask me about:\n• How to use the calendar\n• Wellness and health tips\n• Productivity strategies\n• Or type 'help' for assistance",
  ],
}

/**
 * MAIN CHATBOT COMPONENT
 * ----------------------
 * Props:
 *   - notes: Array of user's notes (used to count notes and show upcoming tasks)
 *   - checkUpcomingTasks: Function to check for tasks due soon
 */
function ChatBot({ notes = [], checkUpcomingTasks }) {
  /**
   * STATE MANAGEMENT
   * ----------------
   * - messages: Array of chat messages (both user and bot)
   * - input: Current text in the input field
   * - isLoading: Whether bot is "thinking" (shows typing indicator)
   * - messagesEndRef: Reference to scroll to bottom of chat
   * - inputRef: Reference to focus input field (if needed)
   */
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm your WellWork assistant. I can help you with your calendar, give wellness tips, or answer questions. Type 'help' to see what I can do!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  /**
   * AUTO-SCROLL FUNCTIONALITY
   * --------------------------
   * Scrolls chat to bottom whenever new messages are added.
   * Uses smooth scrolling for better UX.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * EFFECT: Auto-scroll on new messages
   * ----------------------------------
   * Runs every time messages array changes to keep chat scrolled to bottom.
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * RESPONSE GENERATOR FUNCTION
   * ---------------------------
   * Analyzes user input and returns appropriate bot response.
   * 
   * HOW IT WORKS:
   * 1. Converts message to lowercase for case-insensitive matching
   * 2. Checks for keywords in order of priority
   * 3. Returns matching response from chatbotResponses object
   * 4. Falls back to default response if no match found
   * 
   * KEYWORD MATCHING PRIORITY:
   * - Greetings (hi, hello, hey, etc.)
   * - Help requests
   * - Calendar/notes keywords
   * - Wellness tips keywords
   * - Productivity keywords
   * - Note statistics queries
   * - Upcoming tasks queries
   * - Default fallback
   */
  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim()

    // Greeting detection - matches common greeting patterns
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return chatbotResponses.greeting[
        Math.floor(Math.random() * chatbotResponses.greeting.length)
      ]
    }

    // Help requests - shows available features
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return chatbotResponses.help[0]
    }

    // Calendar-related queries - helps with calendar and notes
    if (
      lowerMessage.includes('calendar') ||
      lowerMessage.includes('note') ||
      lowerMessage.includes('date') ||
      lowerMessage.includes('add') ||
      lowerMessage.includes('save') ||
      lowerMessage.includes('delete')
    ) {
      return chatbotResponses.calendar[
        Math.floor(Math.random() * chatbotResponses.calendar.length)
      ]
    }

    // Wellness tips - provides health and wellness advice
    if (
      lowerMessage.includes('tip') ||
      lowerMessage.includes('advice') ||
      lowerMessage.includes('wellness') ||
      lowerMessage.includes('health') ||
      lowerMessage.includes('suggest') ||
      lowerMessage.includes('recommend')
    ) {
      return chatbotResponses.tips[
        Math.floor(Math.random() * chatbotResponses.tips.length)
      ]
    }

    // Productivity advice - helps with work and organization
    if (
      lowerMessage.includes('productivity') ||
      lowerMessage.includes('focus') ||
      lowerMessage.includes('work') ||
      lowerMessage.includes('task') ||
      lowerMessage.includes('organize') ||
      lowerMessage.includes('efficient')
    ) {
      return chatbotResponses.productivity[
        Math.floor(Math.random() * chatbotResponses.productivity.length)
      ]
    }

    // Notes statistics - counts user's notes
    if (lowerMessage.includes('how many') || lowerMessage.includes('notes')) {
      const noteCount = notes.length
      if (noteCount === 0) {
        return "You don't have any notes yet. Click on a date in the calendar to add your first note!"
      }
      return `You currently have ${noteCount} note${noteCount === 1 ? '' : 's'} saved in your calendar. Keep track of your thoughts and tasks!`
    }

    // Upcoming tasks - shows tasks due in next 2 days
    if (
      lowerMessage.includes('upcoming') ||
      lowerMessage.includes('due') ||
      lowerMessage.includes('soon') ||
      lowerMessage.includes('remind') ||
      lowerMessage.includes('task')
    ) {
      // First try to use the checkUpcomingTasks function from parent
      if (checkUpcomingTasks) {
        const reminder = checkUpcomingTasks()
        if (reminder) {
          // Remove emoji prefix if present using string methods
          let cleanMessage = reminder.message.trim()
          if (cleanMessage.startsWith('🔔') || cleanMessage.startsWith('⚠️') || cleanMessage.startsWith('⏰') || cleanMessage.startsWith('📅')) {
            cleanMessage = cleanMessage.slice(2).trim()
          }
          return `🔔 ${cleanMessage}\n\nYou have tasks coming up! Check your calendar to see all upcoming notes.`
        }
      }
      
      // Fallback: manually check notes for next 2 days
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date(today)
      dayAfter.setDate(dayAfter.getDate() + 2)

      const upcoming = notes.filter((note) => {
        if (!note.date) return false
        const noteDate = new Date(note.date + 'T00:00:00')
        noteDate.setHours(0, 0, 0, 0)
        return noteDate >= today && noteDate <= dayAfter
      })

      if (upcoming.length === 0) {
        return "You don't have any tasks due in the next 2 days. Great job staying on top of things! 🎉"
      }

      let response = `You have ${upcoming.length} task${upcoming.length === 1 ? '' : 's'} coming up:\n\n`
      upcoming.forEach((note) => {
        const noteDate = new Date(note.date + 'T00:00:00')
        const daysUntil = Math.ceil((noteDate - today) / (1000 * 60 * 60 * 24))
        const dateLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`
        response += `📅 ${dateLabel}: ${note.content.substring(0, 40)}${note.content.length > 40 ? '...' : ''}\n`
      })

      return response
    }

    // Default response - when no keywords match
    return chatbotResponses.default[
      Math.floor(Math.random() * chatbotResponses.default.length)
    ]
  }

  /**
   * MESSAGE SUBMISSION HANDLER
   * --------------------------
   * Handles form submission when user sends a message.
   * 
   * PROCESS:
   * 1. Prevents default form submission
   * 2. Validates input (must not be empty)
   * 3. Adds user message to chat
   * 4. Shows loading/typing indicator
   * 5. Waits 500ms (simulates thinking time)
   * 6. Generates bot response
   * 7. Adds bot response to chat
   * 8. Hides loading indicator
   * 
   * NOTE: The 500ms delay makes the bot feel more natural.
   * Remove it for instant responses, or increase for slower feel.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])

    // Simulate thinking delay (500ms) before responding
    setTimeout(() => {
      const botResponse = getResponse(userMessage)

      setMessages((prev) => [...prev, { role: 'bot', text: botResponse }])
      setIsLoading(false)
    }, 500)
  }

  /**
   * RENDER
   * ------
   * Returns the chatbot UI with:
   * - Header with title and subtitle
   * - Messages container (scrollable)
   * - Input form with text field and send button
   * 
   * UI STRUCTURE:
   * - Messages are mapped from state array
   * - Each message has role (user/bot) for styling
   * - Typing indicator shows when isLoading is true
   * - messagesEndRef div is used for auto-scrolling
   * - Form handles Enter key and button click
   */
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>💬 WellWork Assistant</h3>
        <p className="chatbot-subtitle">Ask me anything about your calendar or wellness!</p>
      </div>

      <div className="chatbot-messages">
        {/* Render all messages from state */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatbot-message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">{message.text}</div>
          </div>
        ))}
        {/* Show typing indicator when bot is "thinking" */}
        {isLoading && (
          <div className="chatbot-message bot-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {/* Invisible div used for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form - handles message submission */}
      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chatbot-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="chatbot-send-button"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatBot

