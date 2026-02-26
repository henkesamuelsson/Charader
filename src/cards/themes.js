import { cards as generalCards } from './general.js'
import { cards as moviesCards } from './movies.js'
import { cards as jobsCards } from './jobs.js'
import { cards as foodCards } from './food.js'
import { cards as sportsCards } from './sports.js'
import { cards as kidsAnimalsCards } from './kidsAnimals.js'
import { cards as kidsFoodCards } from './kidsFood.js'
import { cards as kidsSportsCards } from './kidsSports.js'
import { cards as kidsHomeCards } from './kidsHome.js'

// ============================================================
// TEMAN – lägg till nya teman eller underkategorier här
// För att lägga till ett nytt tema:
//   1. Skapa en ny fil i src/cards/
//   2. Importera den ovan
//   3. Lägg till den i listan nedan
// ============================================================

export const themes = [
  {
    id: 'general',
    label: 'Blandat',
    emoji: '🎲',
    cards: generalCards,
    // Inget subcategories-fält = ingen expandering i UI
  },
  {
    id: 'movies',
    label: 'Filmer',
    emoji: '🎬',
    cards: moviesCards,
  },
  {
    id: 'jobs',
    label: 'Yrken',
    emoji: '👷',
    cards: jobsCards,
  },
  {
    id: 'food',
    label: 'Mat',
    emoji: '🍕',
    cards: foodCards,
  },
  {
    id: 'sports',
    label: 'Sport',
    emoji: '⚽',
    cards: sportsCards,
  },
  {
    id: 'kids',
    label: 'Barn',
    emoji: '🧒',
    // Barn har inga egna kort – bara underkategorier
    cards: [],
    subcategories: [
      { id: 'kidsAnimals', label: 'Djur',          emoji: '🐘', cards: kidsAnimalsCards },
      { id: 'kidsFood',    label: 'Mat',            emoji: '🍓', cards: kidsFoodCards },
      { id: 'kidsSports',  label: 'Sport',          emoji: '⚽', cards: kidsSportsCards },
      { id: 'kidsHome',    label: 'Saker i hemmet', emoji: '🏠', cards: kidsHomeCards },
    ],
  },
]

// ============================================================
// Hjälpfunktion: bygg kortlistan från valda teman/underkategorier
// selectedThemes = Set av id-strängar, t.ex. { 'movies', 'kidsAnimals', 'kidsFood' }
// ============================================================
export function buildCardPool(selectedThemes) {
  const pool = []

  for (const theme of themes) {
    if (theme.subcategories) {
      // Tema med underkategorier
      const anySubSelected = theme.subcategories.some(s => selectedThemes.has(s.id))
      const themeSelected = selectedThemes.has(theme.id)

      if (themeSelected && !anySubSelected) {
        // Hela barn-temat valt utan specifika underkategorier → ta alla
        theme.subcategories.forEach(s => pool.push(...s.cards))
      } else {
        // Ta bara valda underkategorier
        theme.subcategories
          .filter(s => selectedThemes.has(s.id))
          .forEach(s => pool.push(...s.cards))
      }
    } else {
      if (selectedThemes.has(theme.id)) {
        pool.push(...theme.cards)
      }
    }
  }

  // Deduplicera
  return [...new Set(pool)]
}
