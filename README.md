# WellWork - Productivity & Wellness App

A full-stack productivity and wellness application with calendar, notes, chatbot assistant, and wellness notifications.

## Features

- 📅 **Interactive Calendar** - View and manage your schedule
- 📝 **Daily Notes** - Create and edit notes for specific dates
- 💬 **AI Chatbot Assistant** - Get help with calendar, wellness tips, and productivity advice
- 🔔 **Wellness Notifications** - Random wellness reminders and task alerts
- 📱 **Offline Support** - Works offline with local storage caching
- 🔄 **Auto-Sync** - Automatically syncs when backend comes online
- 📱 **Mobile App Ready** - Can be built as native Android/iOS app

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Node.js + Express
- **Authentication**: JWT tokens
- **Storage**: File-based (JSON) + LocalStorage for offline
- **Mobile**: Capacitor (Android & iOS)

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone Repository

```bash
git clone https://github.com/rowenbonaobra23-codecode/WellWork.git
cd WellWork
```

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Open in Browser

Navigate to `http://localhost:5173` and start using WellWork!

## Mobile App Setup

Want to build a native mobile app? See **[MOBILE_SETUP.md](frontend/MOBILE_SETUP.md)** for detailed instructions.

**Quick mobile setup:**

1. Build the app: `cd frontend && npm run build`
2. Add Android: `npm run cap:add android`
3. Configure API URL in `src/mobileConfig.js` (use your computer's IP)
4. Open Android Studio: `npm run cap:android`

## Project Structure

```
WellWork/
├── backend/           # Express API server
│   ├── server.js     # Main server file
│   ├── user.json     # User data storage
│   └── notes.json    # Notes data storage
├── frontend/         # React frontend
│   ├── src/
│   │   ├── App.jsx   # Main app component
│   │   ├── Calendar.jsx
│   │   ├── Notes.jsx
│   │   ├── ChatBot.jsx
│   │   └── ...
│   └── capacitor.config.js  # Mobile app config
└── README.md
```

## API Endpoints

- `GET /health` - Health check
- `POST /register` - Create user account
- `POST /login` - Authenticate user
- `GET /api/notes` - Get user's notes (protected)
- `POST /api/notes` - Create/update note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)

## Environment Variables

### Backend (.env)

```env
PORT=5000
JWT_SECRET=workwell-dev-secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

For mobile apps, use your computer's IP address instead of localhost.

## Offline Mode

The app includes full offline support:

- ✅ Notes cached in localStorage
- ✅ Session persistence
- ✅ Auto-sync when backend comes online
- ✅ Request queue for failed operations
- ✅ Seamless offline/online transitions

## Development

### Backend Development

```bash
cd backend
npm run dev    # Auto-restarts on save (requires nodemon)
npm start      # Plain node
```

### Frontend Development

```bash
cd frontend
npm run dev    # Vite dev server with hot reload
npm run build  # Production build
npm run preview # Preview production build
```

## Building for Production

### Web

```bash
cd frontend
npm run build
# Output in dist/ folder
```

### Mobile

See [MOBILE_SETUP.md](frontend/MOBILE_SETUP.md) for Android/iOS build instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Express, and Capacitor**
