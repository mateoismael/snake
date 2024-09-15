const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Screen configuration
const width = 800;
const height = 600;
canvas.width = width;
canvas.height = height;

// Colors
const colors = {
    black: '#000000',
    white: '#00FF00',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF'
};

// Snake
const snakeBlock = 20;
const margin = 0;

let snakeList = [];
let lengthOfSnake = 1;
let x1 = width / 2;
let y1 = height / 2;
let x1Change = 0;
let y1Change = 0;
let foodx, foody;
let gameClose = false;
let highScore = getHighScore();
let direction = "";
let gameLoop;

function getRandomFoodPosition(dimension, margin, block) {
    return Math.floor(Math.random() * (dimension - 2 * margin) / block) * block + margin;
}

function drawSnake() {
    ctx.fillStyle = colors.green;
    snakeList.forEach(([x, y]) => ctx.fillRect(x, y, snakeBlock, snakeBlock));
}

function getHighScore() {
    return parseInt(localStorage.getItem('highScore')) || 0;
}

function saveHighScore(score) {
    localStorage.setItem('highScore', score);
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
    x1 = width / 2;
    y1 = height / 2;
    x1Change = 0;
    y1Change = 0;
    foodx = getRandomFoodPosition(width, margin, snakeBlock);
    foody = getRandomFoodPosition(height, margin, snakeBlock);
    direction = "";
    gameClose = false;
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
    }
}

function startGame() {
    resetGame();
    gameLoop = setInterval(updateGameArea, 100);
}

function updateGameArea() {
    if (gameClose) {
        clearInterval(gameLoop);
        showGameOverScreen();
        return;
    }

    if (x1 + x1Change >= width || x1 + x1Change < 0 || 
        y1 + y1Change >= height || y1 + y1Change < 0) {
        gameClose = true;
        return;
    }

    x1 += x1Change;
    y1 += y1Change;

    ctx.fillStyle = colors.black;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = colors.green;
    ctx.strokeRect(0, 0, width, height);
    
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
        foodx = getRandomFoodPosition(width, margin, snakeBlock);
        foody = getRandomFoodPosition(height, margin, snakeBlock);
        lengthOfSnake++;
        if (lengthOfSnake - 1 > highScore) {
            highScore = lengthOfSnake - 1;
            saveHighScore(highScore);
        }
        updateScoreboard();
    }
}

function showStartScreen() {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
}

function hideStartScreen() {
    startScreen.style.display = 'none';
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
    document.getElementById('finalLength').textContent = padScore(lengthOfSnake - 1);
    document.getElementById('finalBest').textContent = padScore(highScore);
}

function hideGameOverScreen() {
    gameOverScreen.style.display = 'none';
}

document.addEventListener('keydown', handleKeyDown);

window.onload = showStartScreen;