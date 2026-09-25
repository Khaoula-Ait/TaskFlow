# TaskFlow Desktop & Web App

A high-performance desktop-grade task & project management application with Kanban, Eisenhower matrix, audio chimes, and Pomodoro focus timer.

## Running Locally

Once you clone this repository to your computer:

### 1. Install dependencies
```bash
npm install
```

---

### Option A: Run in Browser (Local Web App)
To run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. From there, you can also click Chrome/Edge's **Install** button to install it as a desktop PWA.

---

### Option B: Run as a Native Desktop Window (Electron)
The repository includes `electron.js` to run TaskFlow as a native macOS/Windows/Linux window:

1. Build the production files:
```bash
npm run build
```

2. Launch the desktop app:
```bash
npx electron electron.js
```

---

### Option C: Package into an `.exe` (Windows) or `.dmg` (macOS) Installer
If you want to produce a standalone installer executable for your operating system:

```bash
# Install electron-builder
npm install electron-builder --save-dev

# Package the app for your OS
npx electron-builder
```
The installer (`.exe` or `.dmg`) will appear in the `dist` folder.
