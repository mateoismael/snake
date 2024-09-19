const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Colors
const colors = {
    black: '#000000',
    white: '#00FF00',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF'
};

// Snake
let snakeBlock;
let margin;
let snakeList = [];
let lengthOfSnake = 1;
let x1, y1;
let x1Change = 0;
let y1Change = 0;
let foodx, foody;
let gameClose = false;
let highScore = 0;
let direction = "";
let gameLoop;

// Audio
const eatSound = new Audio('./assets/audio/eat.mp3');
const gameOverSound = new Audio('./assets/audio/gameover.mp3');
const moveSound = new Audio('./assets/audio/move.mp3');
const startScreenSound = new Audio('./assets/audio/start_screen.mp3');

eatSound.volume = 0.3;
gameOverSound.volume = 0.3;
moveSound.volume = 0.2;
startScreenSound.volume = 1;
startScreenSound.loop = true;

let moveSoundInterval;
let isMoving = false;

function resizeCanvas() {
    const container = document.getElementById('innerBorder');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    snakeBlock = Math.floor(Math.min(canvas.width, canvas.height) / 20);
    margin = snakeBlock;
    x1 = Math.floor(canvas.width / 2 / snakeBlock) * snakeBlock;
    y1 = Math.floor(canvas.height / 2 / snakeBlock) * snakeBlock;
    foodx = getRandomFoodPosition(canvas.width, margin, snakeBlock);
    foody = getRandomFoodPosition(canvas.height, margin, snakeBlock);
    
    // Redibujar el juego después de redimensionar
    if (gameLoop) {
        updateGameArea();
    }
}

function getRandomFoodPosition(dimension, margin, block) {
    return Math.floor(Math.random() * (dimension - 2 * margin) / block) * block + margin;
}

function drawSnake() {
    ctx.fillStyle = colors.green;
    snakeList.forEach(([x, y]) => ctx.fillRect(x, y, snakeBlock, snakeBlock));
}

async function getHighScore() {
    try {
        const response = await fetch('/api/highscore');
        const data = await response.json();
        return data.highScore;
    } catch (error) {
        console.error('Error al obtener el high score:', error);
        return 0;
    }
}

async function saveHighScore(score) {
    try {
        await fetch('/api/highscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score }),
        });
    } catch (error) {
        console.error('Error al guardar el high score:', error);
    }
}

function padScore(score) {
    return score.toString().padStart(3, '0');
}

function updateScoreboard() {
    document.getElementById('currentLength').textContent = padScore(lengthOfSnake - 1);
    document.getElementById('bestLength').textContent = padScore(highScore);
}

function resetGame() {
    snakeList = [];
    lengthOfSnake = 1;
    x1Change = 0;
    y1Change = 0;
    direction = "";
    gameClose = false;
    resizeCanvas();
    updateScoreboard();
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        if (startScreen.style.display !== 'none') {
            hideStartScreen();
            showGameScreen();
            startGame();
        } else if (gameOverScreen.style.display !== 'none') {
            hideGameOverScreen();
            showGameScreen();
            startGame();
        }
        return;
    }

    if (gameClose) return;

    const keyActions = {
        'ArrowLeft': () => direction !== "RIGHT" && (x1Change = -snakeBlock, y1Change = 0, direction = "LEFT"),
        'ArrowRight': () => direction !== "LEFT" && (x1Change = snakeBlock, y1Change = 0, direction = "RIGHT"),
        'ArrowUp': () => direction !== "DOWN" && (y1Change = -snakeBlock, x1Change = 0, direction = "UP"),
        'ArrowDown': () => direction !== "UP" && (y1Change = snakeBlock, x1Change = 0, direction = "DOWN"),
        'a': () => direction !== "RIGHT" && (x1Change = -snakeBlock, y1Change = 0, direction = "LEFT"),
        'd': () => direction !== "LEFT" && (x1Change = snakeBlock, y1Change = 0, direction = "RIGHT"),
        'w': () => direction !== "DOWN" && (y1Change = -snakeBlock, x1Change = 0, direction = "UP"),
        's': () => direction !== "UP" && (y1Change = snakeBlock, x1Change = 0, direction = "DOWN")
    };

    const key = event.key;
    if (keyActions[key]) {
        keyActions[key]();
        if (x1Change !== 0 || y1Change !== 0) {
            isMoving = true;
            playMoveSound();
        }
    }
}

async function startGame() {
    resetGame();
    highScore = await getHighScore();
    updateScoreboard();
    gameLoop = setInterval(updateGameArea, 100);
}

async function updateGameArea() {
    if (gameClose) {
        clearInterval(gameLoop);
        stopMoveSound();
        showGameOverScreen();
        return;
    }

    if (x1 + x1Change >= canvas.width || x1 + x1Change < 0 || 
        y1 + y1Change >= canvas.height || y1 + y1Change < 0) {
        gameClose = true;
        return;
    }

    x1 += x1Change;
    y1 += y1Change;

    ctx.fillStyle = colors.black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = colors.green;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = colors.red;
    ctx.fillRect(foodx, foody, snakeBlock, snakeBlock);
    
    let snakeHead = [x1, y1];
    snakeList.push(snakeHead);
    if (snakeList.length > lengthOfSnake) {
        snakeList.shift();
    }

    if (snakeList.slice(0, -1).some(([x, y]) => x === snakeHead[0] && y === snakeHead[1])) {
        gameClose = true;
    }

    drawSnake();
    
    if (x1 === foodx && y1 === foody) {
        foodx = getRandomFoodPosition(canvas.width, margin, snakeBlock);
        foody = getRandomFoodPosition(canvas.height, margin, snakeBlock);
        lengthOfSnake++;
        playEatSound();
        if (lengthOfSnake - 1 > highScore) {
            highScore = lengthOfSnake - 1;
            await saveHighScore(highScore);
        }
        updateScoreboard();
    }
}

function showStartScreen() {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    playStartScreenSound();
}

function hideStartScreen() {
    startScreen.style.display = 'none';
    stopStartScreenSound();
}

function showGameScreen() {
    gameScreen.style.display = 'flex';
}

function hideGameScreen() {
    gameScreen.style.display = 'none';
}

function showGameOverScreen() {
    gameOverScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    playGameOverSound();
    document.getElementById('finalLength').textContent = padScore(lengthOfSnake - 1);
    document.getElementById('finalBest').textContent = padScore(highScore);
}

function hideGameOverScreen() {
    gameOverScreen.style.display = 'none';
}

function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}

function playGameOverSound() {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}

function playMoveSound() {
    if (!moveSoundInterval && isMoving) {
        moveSoundInterval = setInterval(() => {
            moveSound.currentTime = 0;
            moveSound.play();
        }, 250);
    }
}

function stopMoveSound() {
    if (moveSoundInterval) {
        clearInterval(moveSoundInterval);
        moveSoundInterval = null;
    }
}

function playStartScreenSound() {
    startScreenSound.play().catch(error => {
        console.error("Error al reproducir el sonido:", error);
    });
}

function stopStartScreenSound() {
    startScreenSound.pause();
    startScreenSound.currentTime = 0;
}

document.addEventListener('keydown', handleKeyDown);

window.onload = () => {
    showStartScreen();
    resizeCanvas();
};

window.addEventListener('resize', resizeCanvas);

document.addEventListener('click', function() {
    if (startScreen.style.display !== 'none') {
        playStartScreenSound();
    }
});