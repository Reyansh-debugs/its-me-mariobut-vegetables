const player = document.getElementById('player');
const container = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level-display');
const tempoStatus = document.getElementById('tempo-status');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const deathReasonDisplay = document.getElementById('death-reason');
const bgMusic = document.getElementById('bg-music');

let isJumping = false;
let playerY = 0;
let score = 0;
let level = 1;
let gameActive = true;
let spawnTimer;

// Level Configs (Speed modifiers & Background colors)
const levelSettings = {
    1: { speedMod: 1.0, bg: "linear-gradient(to bottom, #2c3e50 60%, #1e3f20 60%)", status: "Chill Forest Woods" },
    2: { speedMod: 1.3, bg: "linear-gradient(to bottom, #4a148c 60%, #1b5e20 60%)", status: "Panic Corporate Dusk" },
    3: { speedMod: 1.7, bg: "linear-gradient(to bottom, #880e4f 60%, #0d47a1 60%)", status: "Neon Avocado Overdrive 🚨" }
};

const funnyDeathMessages = [
    "You were turned into overpriced corporate Guacamole.",
    "A corporate ladder crushed your organic dreams.",
    "The flying paperwork forced you into an unpaid internship.",
    "You got mashed on sourdough by an aggressive influencer."
];

// Start audio & Controls
document.addEventListener('keydown', function(event) {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && gameActive) {
        // Try starting background music on first jump interaction (browser rule)
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Audio waiting for full interaction."));
        }
        
        if (!isJumping) {
            jump();
        }
    }
});

function jump() {
    isJumping = true;
    let jumpCount = 0;
    
    let upInterval = setInterval(() => {
        if (jumpCount >= 25 || !gameActive) {
            clearInterval(upInterval);
            
            let downInterval = setInterval(() => {
                if (playerY <= 0 || !gameActive) {
                    clearInterval(downInterval);
                    playerY = 0;
                    player.style.bottom = '160px';
                    isJumping = false;
                } else {
                    playerY -= 5;
                    player.style.bottom = (160 + playerY) + 'px';
                }
            }, 12);
        } else {
            playerY += 6;
            player.style.bottom = (160 + playerY) + 'px';
            jumpCount++;
        }
    }, 12);
}

// Spawning Logic with Speed Modifiers
function spawnHazards() {
    if (!gameActive) return;

    const currentMod = levelSettings[level]?.speedMod || 2.0;
    const hazardType = Math.random() > 0.5 ? 'ladder' : 'flying';
    const hazard = document.createElement('div');
    let hazardLeft = 800;
    
    if (hazardType === 'ladder') {
        hazard.classList.add('obstacle');
        hazard.style.left = hazardLeft + 'px';
        container.appendChild(hazard);
        
        let moveInterval = setInterval(() => {
            if (!gameActive) { clearInterval(moveInterval); return; }
            hazardLeft -= (5 * currentMod);
            hazard.style.left = hazardLeft + 'px';

            if (hazardLeft > 100 && hazardLeft < 140 && playerY < 60) {
                endGame();
                clearInterval(moveInterval);
            }

            if (hazardLeft < -40) {
                clearInterval(moveInterval);
                hazard.remove();
                updateScore();
            }
        }, 15);

    } else {
        hazard.classList.add('projectile');
        const flyingThings = ['💼', '📄', '📈', '☕', '📠'];
        hazard.innerText = flyingThings[Math.floor(Math.random() * flyingThings.length)];
        
        let flyingHeight = 30 + Math.floor(Math.random() * 80); 
        hazard.style.bottom = (160 + flyingHeight) + 'px';
        hazard.style.left = hazardLeft + 'px';
        container.appendChild(hazard);

        let moveInterval = setInterval(() => {
            if (!gameActive) { clearInterval(moveInterval); return; }
            hazardLeft -= (7 * currentMod);
            hazard.style.left = hazardLeft + 'px';

            if (hazardLeft > 100 && hazardLeft < 130 && Math.abs(playerY - flyingHeight) < 25) {
                endGame();
                clearInterval(moveInterval);
            }

            if (hazardLeft < -40) {
                clearInterval(moveInterval);
                hazard.remove();
                updateScore();
            }
        }, 15);
    }

    // Spawning becomes tighter based on active level
    let nextSpawn = (1200 / currentMod) + Math.random() * 1000;
    spawnTimer = setTimeout(spawnHazards, nextSpawn);
}

function updateScore() {
    score++;
    scoreDisplay.innerText = score;

    // Level-Up Logic
    if (score === 5 && level === 1) levelUp(2);
    if (score === 12 && level === 2) levelUp(3);
}

function levelUp(nextLevel) {
    level = nextLevel;
    levelDisplay.innerText = level;
    
    // Apply new Level Visuals
    container.style.background = levelSettings[level].bg;
    tempoStatus.innerText = levelSettings[level].status;
}

function endGame() {
    gameActive = false;
    clearTimeout(spawnTimer);
    bgMusic.pause();
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.innerText = score;
    deathReasonDisplay.innerText = funnyDeathMessages[Math.floor(Math.random() * funnyDeathMessages.length)];
}

function resetGame() {
    document.querySelectorAll('.obstacle, .projectile').forEach(el => el.remove());
    score = 0;
    level = 1;
    playerY = 0;
    player.style.bottom = '160px';
    scoreDisplay.innerText = '0';
    levelDisplay.innerText = '1';
    
    container.style.background = levelSettings[1].bg;
    tempoStatus.innerText = levelSettings[1].status;
    
    gameActive = true;
    isJumping = false;
    gameOverScreen.style.display = 'none';
    
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    
    clearTimeout(spawnTimer);
    spawnHazards();
}

// Ignition
spawnHazards();