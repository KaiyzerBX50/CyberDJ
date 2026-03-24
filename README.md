# CyberDJ - Digital Futuristic DJ Turntable

A fully-featured digital DJ turntable web application with dual decks, spectrum visualizer, and live radio station streaming.

## 🔗 Live Demo
**https://cyberdj-frontend-dagawdnyc.zocomputer.io**

## Features

- 🎛️ **Dual Turntables** - Vinyl records with spinning animation and tonearm
- 📻 **Radio Streaming** - Browse and play hip hop, R&B, and other genres
- 🎚️ **Full Mixer** - EQ, faders, crossfader, VU meters
- ✨ **Spectrum Visualizer** - Real-time frequency analysis
- 🔥 **FX Rack** - Echo, Reverb, Filter effects
- 🎹 **Hot Cue Pads** - 8 pads per deck with multiple modes
- 💾 **Favorites** - Save stations to MongoDB

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion, Web Audio API
- **Backend**: FastAPI, Python, MongoDB
- **API**: Radio Browser API

## Quick Start

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend (new terminal)
cd frontend
npm install
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

### Production Build

```bash
cd frontend
REACT_APP_BACKEND_URL=https://cyberdj-backend-dagawdnyc.zocomputer.io npm run build
```

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for full details.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| A | Select Deck A |
| B | Select Deck B |
| S | Station Browser |
| R | Record |

## Design

See [design_guidelines.json](./design_guidelines.json) for the design system.

## Author

Created by KaiyzerBX50
