/**
 * ============================================================================
 * BACKEND SERVER - FAQ & DOCUMENTATION
 * ============================================================================
 * 
 * WHAT DOES THIS SERVER DO?
 * --------------------------
 * Provides REST API backend for WorkWell application:
 * - User authentication (register/login)
 * - JWT token generation and validation
 * - Notes CRUD operations (Create, Read, Update, Delete)
 * - File-based data storage (JSON files)
 * 
 * ARCHITECTURE:
 * ------------
 * - Express.js web server
 * - File-based storage (user.json, notes.json)
 * - JWT authentication middleware
 * - CORS enabled for frontend communication
 * 
 * API ENDPOINTS:
 * -------------
 * GET  /health              - Server health check
 * POST /register            - Create new user account
 * POST /login               - Authenticate user, get JWT token
 * GET  /api/notes           - Get all user's notes (protected)
 * POST /api/notes           - Create or update note (protected)
 * PUT  /api/notes/:id       - Update specific note (protected)
 * DELETE /api/notes/:id     - Delete specific note (protected)
 * 
 * SECURITY:
 * --------
 * - Passwords hashed with bcrypt (10 rounds)
 * - JWT tokens expire after 1 hour
 * - Protected routes require valid JWT token
 * - CORS configured for development
 * 
 * DATA STORAGE:
 * ------------
 * - user.json: Stores user accounts (username, hashed password, ID)
 * - notes.json: Stores all notes (user-specific, date-based)
 * - Files auto-created if missing
 * - Corrupted files auto-reset to empty arrays
 * 
 * COMMON QUESTIONS:
 * ----------------
 * Q: How do I change the port?
 * A: Set PORT environment variable or modify default (currently 5000)
 * 
 * Q: How do I use a real database?
 * A: Replace readUsers/writeUsers and readNotes/writeNotes with database calls
 * 
 * Q: How do I change token expiration?
 * A: Modify expiresIn in jwt.sign() call (currently '1h')
 * 
 * Q: How do I add password reset?
 * A: Add new endpoint that generates reset token and sends email
 * 
 * Q: How do I deploy this?
 * A: Use services like Heroku, Railway, or AWS. Set environment variables.
 * 
 * ============================================================================
 */

const path = require('path');
const fs = require('fs').promises;
const { randomUUID } = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * CONFIGURATION
 * ------------
 * - PORT: Server port (default: 5000)
 * - JWT_SECRET: Secret key for signing tokens (use env var in production!)
 * - DATA_FILE: Path to user data file
 * - NOTES_FILE: Path to notes data file
 */
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'workwell-dev-secret';
const DATA_FILE = path.join(__dirname, 'user.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');

const app = express();

/**
 * MIDDLEWARE SETUP
 * ---------------
 * - CORS: Allows frontend to make requests from any origin (development only!)
 * - Body Parser: Parses JSON request bodies
 * 
 * PRODUCTION NOTE:
 * - Change CORS origin to specific frontend URL in production
 * - Example: origin: 'https://yourdomain.com'
 */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(bodyParser.json());

/**
 * FILE OPERATIONS - USER DATA
 * ---------------------------
 * Reads user data from user.json file.
 * 
 * ERROR HANDLING:
 * - File doesn't exist: Creates empty file, returns []
 * - File is corrupted: Resets to empty file, returns []
 * - File is empty: Returns []
 * - Other errors: Throws error
 * 
 * RETURN FORMAT:
 * Array of user objects: [{ id, username, passwordHash, createdAt }, ...]
 */
async function readUsers() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      // If the JSON file is corrupted, reset it to an empty array
      console.error('Corrupted user.json, resetting file.', parseError);
      await fs.writeFile(DATA_FILE, '[]', 'utf-8');
      return [];
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

async function readNotes() {
  try {
    const raw = await fs.readFile(NOTES_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error('Corrupted notes.json, resetting file.', parseError);
      await fs.writeFile(NOTES_FILE, '[]', 'utf-8');
      return [];
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(NOTES_FILE, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function writeNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}

/**
 * AUTHENTICATION MIDDLEWARE
 * -------------------------
 * Validates JWT token for protected routes.
 * 
 * HOW IT WORKS:
 * 1. Extracts token from Authorization header (format: "Bearer <token>")
 * 2. Verifies token signature and expiration
 * 3. Attaches decoded user data to req.user
 * 4. Calls next() to continue to route handler
 * 
 * ERROR RESPONSES:
 * - 401: No token provided
 * - 403: Invalid or expired token
 * 
 * USAGE:
 * Add as middleware to protected routes:
 * app.get('/api/notes', authenticateToken, handler)
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * REGISTER ENDPOINT
 * ----------------
 * POST /register
 * 
 * Creates a new user account.
 * 
 * REQUEST BODY:
 * { username: string, password: string }
 * 
 * VALIDATION:
 * - Username: Required, trimmed
 * - Password: Required, minimum 6 characters
 * - Username uniqueness: Checked against existing users
 * 
 * PROCESS:
 * 1. Validate input
 * 2. Check if username already exists
 * 3. Hash password with bcrypt (10 rounds)
 * 4. Create user object with UUID
 * 5. Save to user.json file
 * 6. Return success message
 * 
 * RESPONSES:
 * - 201: Registration successful
 * - 400: Missing or invalid input
 * - 409: Username already taken
 * - 500: Server error
 */
app.post('/register', async (req, res) => {
  try {
    const username = req.body?.username?.trim();
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const users = await readUsers();
    const alreadyExists = users.find((user) => user.username === username);

    if (alreadyExists) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // Hash password before storing (never store plain text!)
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: randomUUID(),
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (error) {
    console.error('Register error', error);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
});

/**
 * LOGIN ENDPOINT
 * -------------
 * POST /login
 * 
 * Authenticates user and returns JWT token.
 * 
 * REQUEST BODY:
 * { username: string, password: string }
 * 
 * PROCESS:
 * 1. Validate input
 * 2. Find user by username
 * 3. Compare password hash with bcrypt
 * 4. Generate JWT token (expires in 1 hour)
 * 5. Return token and user info
 * 
 * SECURITY:
 * - Never reveals if username exists (same error for invalid user/password)
 * - Uses bcrypt.compareSync for secure password comparison
 * - Token includes user ID (sub) and username
 * 
 * RESPONSES:
 * - 200: Login successful (returns token and user)
 * - 400: Missing username or password
 * - 401: Invalid credentials
 * - 500: Server error
 */
app.post('/login', async (req, res) => {
  try {
    const username = req.body?.username?.trim();
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password with stored hash
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token (valid for 1 hour)
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

/**
 * GET NOTES ENDPOINT
 * ------------------
 * GET /api/notes
 * Protected route (requires authentication)
 * 
 * Returns all notes belonging to the authenticated user.
 * 
 * AUTHENTICATION:
 * - Requires valid JWT token in Authorization header
 * - Token must not be expired
 * 
 * RESPONSE:
 * Array of note objects: [{ id, userId, date, content, createdAt, updatedAt }, ...]
 * 
 * FILTERING:
 * - Only returns notes where userId matches authenticated user's ID
 * - User ID comes from JWT token (req.user.sub)
 */
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await readNotes();
    const userNotes = notes.filter((note) => note.userId === req.user.sub);
    res.json(userNotes);
  } catch (error) {
    console.error('Get notes error', error);
    res.status(500).json({ message: 'Server error while fetching notes.' });
  }
});

/**
 * CREATE/UPDATE NOTE ENDPOINT
 * ---------------------------
 * POST /api/notes
 * Protected route (requires authentication)
 * 
 * Creates a new note or updates existing note for a date.
 * 
 * REQUEST BODY:
 * { date: string (YYYY-MM-DD), content: string }
 * 
 * LOGIC:
 * - If note exists for this user + date: Updates content
 * - If note doesn't exist: Creates new note
 * - Only one note per user per date
 * 
 * RESPONSE:
 * Returns all user's notes after save (array)
 * 
 * RESPONSES:
 * - 201: Note saved successfully
 * - 400: Missing date or content
 * - 500: Server error
 */
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { date, content } = req.body;

    if (!date || !content || !content.trim()) {
      return res.status(400).json({ message: 'Date and content are required.' });
    }

    const notes = await readNotes();
    const existingNote = notes.find(
      (note) => note.userId === req.user.sub && note.date === date
    );

    if (existingNote) {
      // Update existing note
      existingNote.content = content.trim();
      existingNote.updatedAt = new Date().toISOString();
    } else {
      // Create new note
      const newNote = {
        id: randomUUID(),
        userId: req.user.sub,
        date,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notes.push(newNote);
    }

    await writeNotes(notes);
    const userNotes = notes.filter((note) => note.userId === req.user.sub);
    res.status(201).json(userNotes);
  } catch (error) {
    console.error('Create note error', error);
    res.status(500).json({ message: 'Server error while creating note.' });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const notes = await readNotes();
    const note = notes.find((n) => n.id === id && n.userId === req.user.sub);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    note.content = content.trim();
    note.updatedAt = new Date().toISOString();

    await writeNotes(notes);
    const userNotes = notes.filter((note) => note.userId === req.user.sub);
    res.json(userNotes);
  } catch (error) {
    console.error('Update note error', error);
    res.status(500).json({ message: 'Server error while updating note.' });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await readNotes();
    const filteredNotes = notes.filter(
      (note) => !(note.id === id && note.userId === req.user.sub)
    );

    if (notes.length === filteredNotes.length) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    await writeNotes(filteredNotes);
    const userNotes = filteredNotes.filter((note) => note.userId === req.user.sub);
    res.json(userNotes);
  } catch (error) {
    console.error('Delete note error', error);
    res.status(500).json({ message: 'Server error while deleting note.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`WorkWell backend listening on http://localhost:${PORT}`);
});

