# Offline Apps Hub

PWA-based offline app hub for playing games and using apps without internet connection.

## Features

- 📱 **Progressive Web App (PWA)** - Install and run offline on iOS (Safari) and Android (Chrome)
- 💾 **Selective Download** - Choose which apps to download for offline play
- 💿 **Local Storage** - Save game progress, scores, and app state locally
- 🎮 **Zero Dependencies** - Pure HTML/CSS/JS implementation
- 🔓 **No Server Communication** - Completely self-contained

## How to Use

### Online
1. Visit https://ekusy.github.io/offline-apps-hub/
2. Click on any app link to open it
3. Click "Download for Offline" button in the app to save it for offline use

### Offline
1. Open the app URL directly in your browser
2. The app will load from your device's cache
3. Play and your progress is saved locally

## Installation

### Android (Chrome)
1. Open the app
2. Tap the "Download for Offline" button
3. Confirm installation

### iOS (Safari)
1. Open the app
2. Tap the "Download for Offline" button
3. Follow the instructions to add to home screen via Share menu

## Apps Included

- **15 Puzzle** - Classic sliding number puzzle game
- **Water Sort Puzzle** - Sort colored water between tubes
- **Sudoku** - Classic 9x9 number puzzle with notes and difficulty levels
- **Tower Defense** - Place towers and defend against 10 waves
- **Dungeon Crawler** - Turn-based 7x7 grid RPG across 10 floors
- **Card Battle** - Deck-building card combat through 5 stages
- More games coming soon...

## Project Structure

\`\`\`
/
├── index.html              # Home page (app directory)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (cache management)
├── style.css               # Base styles
├── /apps/
│   └── puzzle/             # 15 Puzzle game
│       ├── index.html
│       ├── style.css
│       └── app.js
└── /assets/                # Shared assets (if needed)
\`\`\`

## Development

Each app is self-contained and can be developed independently. When a user clicks "Download for Offline", the Service Worker caches all files in that app's directory.

## License

This project and included games are free to use and modify.