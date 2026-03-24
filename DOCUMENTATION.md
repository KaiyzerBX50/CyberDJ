# CyberDJ - Full Documentation

## Overview
CyberDJ is a digital futuristic DJ turntable web application with dual turntables, spectrum visualizer, and radio station streaming. Built with React + FastAPI.

## Live URLs
- **Frontend**: https://cyberdj-frontend-dagawdnyc.zocomputer.io
- **Backend API**: https://cyberdj-backend-dagawdnyc.zocomputer.io

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - Turntables with vinyl animation                          │
│  - Spectrum Visualizer (Canvas)                            │
│  - Mixer controls, EQ, FX                                  │
│  - Station Browser                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (CORS enabled)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  - Radio Browser API integration                            │
│  - Audio stream proxy (bypasses CORS)                      │
│  - MongoDB for favorites                                   │
│  - Port: 8000                                              │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB                                   │
│  - Favorites collection                                     │
│  - Status checks                                            │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Radix UI, Lucide React
- **Backend**: FastAPI, Motor (MongoDB async), httpx
- **Database**: MongoDB
- **Audio**: Web Audio API, HTML5 Audio

## Project Structure

```
CyberDJ/
├── README.md                    # Basic instructions
├── DOCUMENTATION.md             # This file
├── design_guidelines.json       # Design system (colors, typography, components)
├── backend/
│   ├── server.py                # FastAPI server with all endpoints
│   ├── requirements.txt         # Python dependencies
│   └── tests/
│       └── test_dj_turntable_api.py
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main application component
│   │   ├── App.css             # App styles
│   │   ├── index.js            # Entry point
│   │   ├── index.css           # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── VinylTurntable.jsx
│   │   │   ├── DeckPanel.jsx
│   │   │   ├── CenterMixer.jsx
│   │   │   ├── Crossfader.jsx
│   │   │   ├── Knob.jsx
│   │   │   ├── StationBrowser.jsx
│   │   │   ├── SpectrumVisualizer.jsx
│   │   │   ├── WaveformDisplay.jsx
│   │   │   └── ui/             # Radix UI components
│   │   ├── hooks/
│   │   │   ├── useAudioDeck.js # Audio handling with Web Audio API
│   │   │   ├── useAudio.js     # Legacy audio hook
│   │   │   └── useRecorder.js  # Recording functionality
│   │   └── lib/
│   │       └── utils.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── server.js               # Static file server for production
├── memory/
│   └── PRD.md                  # Product requirements & feature list
└── test_reports/               # Iteration test results
```

## Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cyan | #00F0FF | Deck A, primary accent |
| Magenta | #FF003C | Deck B, danger |
| Lime | #39FF14 | Active states, LEDs |
| Gold | #FFD700 | VU meters, warnings |
| Background | #080808 | Main background |
| Surface | #0A0A0A | Panels |

### Typography
- **Headings**: Orbitron, Rajdhani
- **Body/UI**: JetBrains Mono, monospace
- **Labels**: Inter, system-ui

### Components
- **VinylTurntable**: Spinning vinyl with tonearm animation
- **DeckPanel**: Full deck controls with pads, FX, sampler
- **CenterMixer**: Master/Booth knobs, channel strips, VU meters
- **SpectrumVisualizer**: Real-time frequency analysis canvas
- **Knob**: Rotary control with tick marks and glow

## API Endpoints

### Backend (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/` | GET | Root info |
| `/api/health` | GET | Health check |
| `/api/stations` | GET | Get radio stations by tag |
| `/api/stations/search` | GET | Search stations by name |
| `/api/favorites` | GET | List favorite stations |
| `/api/favorites` | POST | Add station to favorites |
| `/api/favorites/{uuid}` | DELETE | Remove favorite |
| `/api/stream` | GET | Proxy audio stream |

### Parameters
- `stations?tag=hiphop&limit=30` - Filter by genre
- `stations/search?query=name` - Search by name
- `stream?url=<encoded_url>` - Proxy stream

## Building & Running

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running on localhost:27017

### Backend Setup
```bash
cd CyberDJ/backend
pip install -r requirements.txt
# Set environment variables:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=cyberdj
# CORS_ORIGINS=*
uvicorn server:app --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd CyberDJ/frontend
npm install --legacy-peer-deps

# Build with backend URL
REACT_APP_BACKEND_URL=https://cyberdj-backend-dagawdnyc.zocomputer.io npm run build

# Or for local development
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

### Production Server
```bash
cd CyberDJ/frontend
PORT=3000 node server.js
```

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | Play/Pause on active deck |
| A | Select Deck A |
| B | Select Deck B |
| S | Open Station Browser |
| R | Toggle Recording |

## Features Implemented

### ✅ Completed
- Dual vinyl turntables with spinning animation
- Tonearm animation (plays when music starts)
- Spectrum visualizer with frequency bars
- Oscilloscope overlay
- BPM detection (approximate)
- Key detection (approximate)
- EQ controls (HI, MID, LOW)
- FX Rack (ECHO, REVERB, FILTER)
- Hot Cue pads (8 per deck)
- Beat loop controls
- Pitch slider with key lock
- Sampler buttons (visual)
- Master/Booth volume
- Channel faders with VU meters
- Crossfader
- Radio station browser
- Station search
- Favorites (MongoDB)
- Audio stream proxy
- Recording (basic)

### 🔄 Backlog
- Refine recording (save/download)
- Keyboard shortcuts help modal
- Actual audio effects processing
- Sampler audio playback

## Testing
Run frontend tests:
```bash
cd CyberDJ/frontend
npm test
```

Run backend tests:
```bash
cd CyberDJ/backend
pytest
```

## Deployment (Zo Services)

### Backend Service
```json
{
  "label": "cyberdj-backend",
  "protocol": "http",
  "local_port": 8000,
  "entrypoint": "uvicorn server:app --host 0.0.0.0 --port 8000",
  "workdir": "/home/workspace/CyberDJ/backend"
}
```

### Frontend Service
```json
{
  "label": "cyberdj-frontend", 
  "protocol": "http",
  "local_port": 3000,
  "entrypoint": "node server.js",
  "workdir": "/home/workspace/CyberDJ/frontend"
}
```

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=cyberdj
CORS_ORIGINS=*
```

### Frontend (build time)
```
REACT_APP_BACKEND_URL=https://cyberdj-backend-dagawdnyc.zocomputer.io
```

## License
MIT License - Created by KaiyzerBX50

## Version History
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-14 | Initial release with full DJ interface |
| 1.0.1 | 2026-03-15 | Fixed backend URL for production |
