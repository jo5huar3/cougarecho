# Echo - Music Streaming Platform

## Overview
Echo is a modern web-based music streaming platform that connects listeners with artists. It offers a seamless experience for music streaming, playlist creation, and artist content management.

## Features

### User Types
- **Listeners**: Can stream music, create playlists, and follow artists
- **Artists**: Can upload music, manage albums, and track performance
- **Admins**: Can manage content, handle reports, and oversee platform activity

### Core Functionality
- User authentication (login/register)
- Profile management with photo uploads
- Music streaming
- Playlist creation and management
- Album management for artists
- Search functionality
- Admin dashboard with content moderation
- Activity tracking system

### Key Features by User Type

#### Listeners
- Create and manage personal playlists
- Search for songs and artists
- Follow favorite artists
- Customize profile

#### Artists
- Upload and manage albums
- Track streaming statistics
- View listener engagement
- Generate performance reports

#### Admins
- Monitor reported content
- Generate system reports
- Manage user accounts
- Track platform activity

## Technology Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- React Router (for navigation)

### UI Components
- Custom components
- Responsive design
- Dark theme

## Project Structure
```
client/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   └── assets/
├── public/
├── index.html
├── package.json
└── vite.config.js

server/
├── config/
├── routes/
├── uploads/
├── package.json
└── server.js
```

## Setup and Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Start both servers in split terminals:
```bash
# Terminal 1 - Start client
cd client
npm run dev

# Terminal 2 - Start server
cd server
npm run dev
```

## Environment Variables
Create `.env` files in both client and server directories:

Client `.env`:
```
VITE_API_URL=your_api_url_here
```

Server `.env`:
```
DB_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## Available Scripts
- `npm run dev` - Starts development server
- `npm run build` - Creates production build
- `npm run preview` - Preview production build

## Navigation
The app uses React Router for navigation. Main routes:
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/homepage` - Main dashboard
- `/admin` - Admin dashboard
- `/artist` - Artist dashboard
- `/listener` - Listener profile
- `/album` - Album view
- `/playlist` - Playlist view

## Styling
The project uses Tailwind CSS for styling with a custom color scheme:
- Primary: `#1ED760` (Echo Green)
- Background: `#121212` (Dark Mode)
- Text: `#EBE7CD` (Light Text)
- Accent: `#2A2A2A` (Secondary Background)

## Team Members
- Josh
- Yeni
- Thinh
- Will
- Mustafa
