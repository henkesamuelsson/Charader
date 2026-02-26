# Charader-spelet ⚡ React + Vite

Migrerad från vanilla HTML/JS till React + Vite.

## Kom igång

### 1. Installera beroenden
```bash
npm install
```

### 2. Lägg till dina kort
Ersätt innehållet i `src/cards.js` med dina egna kort från din gamla `cards.js`.

### 3. Lägg till ljudfiler
Kopiera dina ljudfiler till `public/sounds/`:
- `public/sounds/fanfare.mp3`
- `public/sounds/kitchen-timer.mp3`

### 4. Starta dev-server
```bash
npm run dev
```

### 5. Bygg för produktion
```bash
npm run build
```
Bygget hamnar i `dist/` och kan hostas var som helst (Netlify, GitHub Pages, etc.)

## Projektstruktur
```
src/
  components/
    SetupScreen.jsx    # Spelarinställningar
    PlayArea.jsx       # Spellogik och kortvisning
    Scoreboard.jsx     # Poängtavla
    Timer.jsx          # Nedräkningstimer
    GameOver.jsx       # Vinstskärm
  App.jsx              # Rotkomponent
  cards.js             # Kortlistan
  style.css            # Din ursprungliga CSS (oförändrad)
  main.jsx             # Entry point
```

## Poängsystem
- **3 poäng** till den som gissade rätt
- **1 poäng** till den som chararade
