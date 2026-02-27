# Kenkan Score Tracker - Vue.js Version

This is a complete Vue.js 3 rewrite of the original Kenkan game scoring application, maintaining 100% of the original functionality with a modern development approach.

## What Changed

### Architecture
- **From**: Vanilla JavaScript with jQuery
- **To**: Vue 3 + Vite for modern frontend development

### Key Features Preserved
✅ Game creation with custom max scores  
✅ Dynamic player management (add/remove)  
✅ Score tracking with multiple action types (Hand, SuperHand, FullHand, Finished)  
✅ Score adjustment with bonus buttons  
✅ Winner/Loser classification  
✅ Undo functionality  
✅ LocalStorage persistence  
✅ Service Worker for offline support  
✅ Fully responsive design  
✅ Arabic language support  

## Project Structure

```
src/
├── main.js              # Vue app entry point
├── App.vue              # Root component
├── gameUtils.js         # Pure game logic utilities
└── components/
    ├── PlayersTable.vue      # Active players display
    ├── LosersTable.vue       # Eliminated players display
    └── ScoreInputModal.vue   # Score input modal
```

## Installation & Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The app will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Output goes to the `dist/` folder

### Preview Production Build
```bash
npm run preview
```

## Technical Details

### Technologies Used
- **Vue 3**: Composition API for reactive state management
- **Vite**: Lightning-fast build tool and dev server
- **Bootstrap 5**: CSS framework for styling
- **LocalStorage API**: For data persistence

### Game Logic
All game logic is contained in `src/gameUtils.js`, which provides pure functions independent of the UI framework. This makes the logic:
- Easy to test
- Reusable across different frontends
- Framework-agnostic

### Components
1. **App.vue**: Main container managing game state and modal visibility
2. **PlayersTable.vue**: Displays active players with add/remove functionality
3. **LosersTable.vue**: Shows eliminated players
4. **ScoreInputModal.vue**: Handles score input with bonus buttons and winner selection

## Game Rules

- **Hand**: 200 points (or -60 for winner)
- **SuperHand**: 400 points (or -120 for winner)
- **FullHand**: 600 points (or -180 for winner)
- **Finished**: 100 points (or -30 for winner)
- Game ends when a player reaches the maximum score
- Only players below max score can play

## Browser Support
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Service Worker support required for offline functionality

## Offline Support
The app includes a Service Worker that caches the app shell for offline access.

## Original Version
The original vanilla JavaScript version is backed up as `main.old.js` for reference.

## Author
Abdullah Ali

## License
ISC
