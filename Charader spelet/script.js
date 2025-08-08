// === IMPORTS ===
import { cards } from './cards.js';

// === DOM ELEMENTS ===
const DOM = {
  cardDisplay: document.getElementById("active-card"),
  nextCardBtn: document.getElementById("next-card"),
  nextPlayerBtn: document.getElementById("next-player-btn"),
  endRoundBtn: document.getElementById("end-round"),
  playerCountInput: document.getElementById("player-count"),
  nameFieldsContainer: document.getElementById("name-fields"),
  setupSection: document.getElementById("setup"),
  playAreaSection: document.getElementById("play-area"),
  cardContainer: document.getElementById("card-container"),
  guessedPlayerSelect: document.getElementById("guessed-player"),
  guessedLabel: document.getElementById("guessed-label"),
  playerHighlight: document.querySelector(".player-name-highlight"),
  scoreList: document.getElementById("score-list"),
  roundIndicator: document.getElementById("round-indicator"),
  timerContainer: document.getElementById("timer-container"),
  playerTimer: document.getElementById("player-timer")
};

// === GAME STATE ===
let players = [];
let roundsPerPlayer = 3;
let currentRound = 1;
let currentPlayerIndex = 0;
let awaitingGuess = false;
let timerInterval;

// === SOUND EFFECTS ===
const fanfareSound = new Audio('sounds/fanfare.mp3');
const timerSound = new Audio('sounds/kitchen-timer.mp3');
fanfareSound.volume = 1.0;
timerSound.volume = 1.0;

// === INITIALIZATION ===
function createNameFields() {
  const count = parseInt(DOM.playerCountInput.value);

  // Kontrollera att antalet spelare är mellan 1 och 10
  if (isNaN(count) || count < 1 || count > 10) {
    alert("Antal spelare måste vara mellan 1 och 10.");
    return;
  }

  DOM.nameFieldsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Spelare ${i + 1}`;
    input.className = "player-name";
    DOM.nameFieldsContainer.appendChild(input);
  }

  const existingButton = document.getElementById("start-game-btn");
  if (existingButton) existingButton.remove();

  const startButton = document.createElement("button");
  startButton.textContent = "Starta spelet";
  startButton.id = "start-game-btn";
  startButton.onclick = startGame;

  DOM.setupSection.appendChild(startButton);
}


function startGame() {
  const nameInputs = document.querySelectorAll(".player-name");
  players = Array.from(nameInputs).map((input, index) => ({
    name: input.value.trim() || `Spelare ${index + 1}`,
    score: 0
  }));

  const roundInput = document.getElementById("round-count");
  const parsedRounds = parseInt(roundInput.value);

  // Kontrollera att rundantalet är mellan 1 och 20
  if (isNaN(parsedRounds) || parsedRounds < 1 || parsedRounds > 20) {
    alert("Antal rundor per spelare måste vara mellan 1 och 20.");
    return;
  }

  roundsPerPlayer = parsedRounds;
  currentRound = 1;

  DOM.setupSection.style.display = "none";
  DOM.playAreaSection.style.display = "block";

  showGameElements();
  updateGuessedPlayerDropdown();
  updatePlayerDisplay();
  updateRoundIndicator();
}


// === GAME LOGIC ===
function endRound() {
  stopPlayerTimer();

  if (!awaitingGuess) {
    DOM.guessedPlayerSelect.style.display = "inline-block";
    DOM.guessedLabel.style.display = "inline-block";
    DOM.endRoundBtn.textContent = "Bekräfta gissning";
    awaitingGuess = true;
    return;
  }

  const selectedValue = DOM.guessedPlayerSelect.value;
  if (selectedValue !== "none") {
    const guessedIndex = parseInt(selectedValue);
    if (!isNaN(guessedIndex)) {
      players[guessedIndex].score += 3;
      players[currentPlayerIndex].score += 1;
    }
  }

  awaitingGuess = false;
  DOM.endRoundBtn.textContent = "Avsluta runda";

  hideGameElements();
  updateScoreboard();
  nextTurn();
}

function nextTurn() {
  stopPlayerTimer();
  DOM.playerTimer.textContent = "";
  DOM.timerContainer.style.display = "none";
  DOM.playerTimer.classList.remove("timer-expired");

  if (awaitingGuess) {
    alert("Du måste först bekräfta gissningen innan du går vidare till nästa spelare.");
    return;
  }

  currentPlayerIndex++;

  if (currentPlayerIndex >= players.length) {
    currentPlayerIndex = 0;
    currentRound++;
  }

  if (currentRound > roundsPerPlayer) {
    endGame();
    return;
  }

  resetCardDisplay();
  showGameElements();
  updatePlayerDisplay();
  updateRoundIndicator();
}


function endGame() {
  hideGameElements();
  DOM.playerHighlight.style.display = "none";
  DOM.roundIndicator.style.display = "none";
  DOM.nextPlayerBtn.style.display = "none";

  const turLabel = document.querySelector(".turn-label");
  if (turLabel) turLabel.style.display = "none";

  // Hitta högsta poängen
  const highestScore = Math.max(...players.map(p => p.score));

  // Hitta alla spelare med den poängen
  const winners = players.filter(p => p.score === highestScore);

  fanfareSound.play(); // Spela vinstljud

  const message = document.createElement("div");
  message.className = "game-over-message";

  if (winners.length === 1) {
    message.innerHTML = `
      <h2>🎉 Spelet är slut!</h2>
      <p>Vinnare: <strong>${winners[0].name}</strong> med ${highestScore} poäng!</p>
      <button onclick="location.reload()">🔄 Starta om</button>
    `;
  } else {
    const names = winners.map(p => p.name).join(", ");
    message.innerHTML = `
      <h2>🤝 Spelet är slut!</h2>
      <p>Oavgjort mellan: <strong>${names}</strong> – alla med ${highestScore} poäng!</p>
      <button onclick="location.reload()">🔄 Spela igen</button>
    `;
  }

  DOM.playAreaSection.appendChild(message);
}

// === TIMER LOGIC ===
function startPlayerTimer() {
  const useTimer = document.getElementById("use-timer").checked;
  if (!useTimer) return;

  const duration = parseInt(document.getElementById("timer-duration").value) || 30;
  let timeLeft = duration;

  DOM.timerContainer.style.display = "block";
  DOM.playerTimer.textContent = timeLeft;
  DOM.playerTimer.style.color = "#000";
  DOM.playerTimer.classList.remove("timer-expired");

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;

    if (timeLeft > 0) {
      DOM.playerTimer.textContent = timeLeft;

      if (timeLeft === 11) {
      timerSound.play(); // Spela kitchen-timer-ljud
    }
      if (timeLeft <= 10) {
        DOM.playerTimer.style.color = "red";
      }
    } else {
      clearInterval(timerInterval);
      DOM.playerTimer.textContent = "Tiden är slut!";
      DOM.playerTimer.classList.add("timer-expired");
      DOM.playerTimer.style.color = "red";

      // Behåller timerContainer synlig tills rundan avslutas manuellt
      endRound();
    }
  }, 1000);
}


function stopPlayerTimer() {
  clearInterval(timerInterval);
}

// === UI HELPERS ===
function resetCardDisplay() {
  DOM.cardDisplay.textContent = '';
}

function hideGameElements() {
  DOM.cardContainer.style.display = "none";
  DOM.cardDisplay.style.display = "none";
  DOM.nextCardBtn.style.display = "none";
  DOM.endRoundBtn.style.display = "none";
  DOM.guessedPlayerSelect.style.display = "none";
  DOM.guessedLabel.style.display = "none";
}

function showGameElements() {
  DOM.cardContainer.style.display = "block";
  DOM.cardDisplay.style.display = "block";
  DOM.nextCardBtn.style.display = "inline-block";
  DOM.endRoundBtn.style.display = "none";
  DOM.guessedPlayerSelect.style.display = "none";
  DOM.guessedLabel.style.display = "none";
}

function updatePlayerDisplay() {
  DOM.playerHighlight.textContent = players[currentPlayerIndex].name;
  updateScoreboard();
  updateGuessedPlayerDropdown();
}

function updateRoundIndicator() {
  DOM.roundIndicator.textContent = `Runda ${currentRound} av ${roundsPerPlayer}`;
}

function updateScoreboard() {
  DOM.scoreList.innerHTML = "";

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  sortedPlayers.forEach((player, index) => {
    const li = document.createElement("li");

    let medal = "";
    if (index === 0) medal = "🥇 ";
    else if (index === 1) medal = "🥈 ";
    else if (index === 2) medal = "🥉 ";

    li.textContent = `${medal}${player.name}: ${player.score} poäng`;

    if (player.name === players[currentPlayerIndex].name) {
      li.classList.add("active-player");
    }

    DOM.scoreList.appendChild(li);
  });
}

function updateGuessedPlayerDropdown() {
  DOM.guessedPlayerSelect.innerHTML = "";

  players.forEach((player, index) => {
    if (index !== currentPlayerIndex) {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = player.name;
      DOM.guessedPlayerSelect.appendChild(option);
    }
  });

  const noneOption = document.createElement("option");
  noneOption.value = "none";
  noneOption.textContent = "Ingen";
  DOM.guessedPlayerSelect.appendChild(noneOption);
}

// === EVENT LISTENERS ===
DOM.nextCardBtn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * cards.length);
  DOM.cardDisplay.textContent = cards[randomIndex];

  DOM.nextCardBtn.style.display = "none";
  DOM.endRoundBtn.style.display = "inline-block";

  startPlayerTimer();
});

// === GLOBAL EXPORTS ===
window.createNameFields = createNameFields;
window.nextTurn = nextTurn;
window.endRound = endRound;