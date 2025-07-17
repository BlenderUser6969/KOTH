// --- DOM ELEMENTS ---
const gameBody = document.getElementById('game-body');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');

const numTeamsSelect = document.getElementById('num-teams');
const gameDurationInput = document.getElementById('game-duration');
const startGameBtn = document.getElementById('start-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');

const gameTimerDisplay = document.getElementById('game-timer-display');
const scoresContainer = document.getElementById('scores-container');
const controlsContainer = document.getElementById('controls-container');
const winnerAnnouncement = document.getElementById('winner-announcement');
const finalScoresContainer = document.getElementById('final-scores');

// --- GAME STATE & CONFIGURATION ---
const TEAM_CONFIG = {
    1: { name: 'Red', colorClass: 'team1' },
    2: { name: 'Blue', colorClass: 'team2' },
    3: { name: 'Green', colorClass: 'team3' },
    4: { name: 'Yellow', colorClass: 'team4' },
};
const POINTS_PER_SECOND = 10;

let gameState = {};
let gameTimerInterval = null;
let scoreInterval = null;

// --- FUNCTIONS ---

function switchScreen(activeScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    activeScreen.classList.add('active');
}

function updateScoresDisplay() {
    gameState.teams.forEach(team => {
        const scoreEl = document.getElementById(`score-team-${team.id}`);
        if (scoreEl) {
            scoreEl.querySelector('.score').textContent = Math.floor(team.score);
        }
    });
}

function captureHill(teamId) {
    // Stop the previous team from scoring
    if (scoreInterval) clearInterval(scoreInterval);

    gameState.activeTeamId = teamId;

    // Update background color
    gameBody.className = `${TEAM_CONFIG[teamId].colorClass}-active`;

    // Start scoring for the new team (incrementing 10 times per second)
    scoreInterval = setInterval(() => {
        const team = gameState.teams.find(t => t.id === teamId);
        if (team) {
            team.score += POINTS_PER_SECOND / 10;
            updateScoresDisplay();
        }
    }, 100);
}

function endGame() {
    clearInterval(gameTimerInterval);
    clearInterval(scoreInterval);

    // Find the winner
    let winner = { score: -1 };
    if (gameState.teams && gameState.teams.length > 0) {
        winner = gameState.teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    }
    
    // Update game over screen
    winnerAnnouncement.textContent = `${winner.name} Team Wins!`;
    finalScoresContainer.innerHTML = ''; // Clear previous scores
    gameState.teams
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .forEach(team => {
            finalScoresContainer.innerHTML += `<p>${team.name}: ${Math.floor(team.score)} points</p>`;
        });

    gameBody.className = `${TEAM_CONFIG[winner.id].colorClass}-active`;
    switchScreen(gameOverScreen);
}

function startGame() {
    const numTeams = parseInt(numTeamsSelect.value);
    const durationMinutes = parseInt(gameDurationInput.value);
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
        alert("Please enter a valid game duration.");
        return;
    }

    let timeRemaining = durationMinutes * 60;
    
    // 1. Initialize Game State
    gameState = {
        teams: [],
        activeTeamId: null,
    };
    for (let i = 1; i <= numTeams; i++) {
        gameState.teams.push({ id: i, name: TEAM_CONFIG[i].name, score: 0 });
    }

    // 2. Build the Game UI
    scoresContainer.innerHTML = '';
    controlsContainer.innerHTML = '';
    gameState.teams.forEach(team => {
        // Create score display
        scoresContainer.innerHTML += `
            <div id="score-team-${team.id}" class="score-display ${TEAM_CONFIG[team.id].colorClass}">
                ${team.name}
                <span class="score">0</span>
            </div>`;
        // Create control button
        controlsContainer.innerHTML += `
            <button id="btn-team-${team.id}" class="control-btn ${TEAM_CONFIG[team.id].colorClass}">
                ${team.name}
            </button>`;
    });

    // 3. Add event listeners to new buttons
    gameState.teams.forEach(team => {
        document.getElementById(`btn-team-${team.id}`).addEventListener('click', () => captureHill(team.id));
    });
    
    // Set initial timer display
    gameTimerDisplay.textContent = `${String(durationMinutes).padStart(2, '0')}:00`;

    // 4. Start the main game timer
    gameTimerInterval = setInterval(() => {
        timeRemaining--;
        const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const seconds = (timeRemaining % 60).toString().padStart(2, '0');
        gameTimerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);

    // 5. Switch to the game screen
    switchScreen(gameScreen);
}

function resetGame() {
    gameBody.className = '';
    // Reset timer and score intervals if they are somehow running
    if(gameTimerInterval) clearInterval(gameTimerInterval);
    if(scoreInterval) clearInterval(scoreInterval);
    
    switchScreen(setupScreen);
}

// --- EVENT LISTENERS ---
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', resetGame);
