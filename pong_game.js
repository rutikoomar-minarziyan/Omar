// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    width: 10,
    height: 80,
    speed: 6,
    x: 20,
    y: canvas.height / 2 - 40
};

const computerPaddle = {
    width: 10,
    height: 80,
    speed: 5,
    x: canvas.width - 30,
    y: canvas.height / 2 - 40
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = true;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Keyboard events
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Touch support for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseY = touch.clientY - rect.top;
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#667eea';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#1a1a1a');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#667eea');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#764ba2');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#fff');
}

// Update functions
function updatePlayerPaddle() {
    // Arrow key controls
    if (keys['ArrowUp'] && paddle.y > 0) {
        paddle.y -= paddle.speed;
    }
    if (keys['ArrowDown'] && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }
    
    // Mouse controls
    const paddleCenter = paddle.y + paddle.height / 2;
    if (mouseY < paddleCenter - 5) {
        paddle.y = Math.max(0, paddle.y - paddle.speed);
    } else if (mouseY > paddleCenter + 5) {
        paddle.y = Math.min(canvas.height - paddle.height, paddle.y + paddle.speed);
    }
    
    // Keep paddle in bounds
    paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, paddle.y));
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball with slight delay for challenge
    if (ballCenter < computerCenter - 35) {
        computerPaddle.y -= computerPaddle.speed;
    } else if (ballCenter > computerCenter + 35) {
        computerPaddle.y += computerPaddle.speed;
    }
    
    // Keep paddle in bounds
    computerPaddle.y = Math.max(0, Math.min(canvas.height - computerPaddle.height, computerPaddle.y));
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Paddle collision detection
    checkPaddleCollision(paddle);
    checkPaddleCollision(computerPaddle);
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function checkPaddleCollision(paddle) {
    // Calculate closest point on paddle to ball center
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    
    // Calculate distance between ball center and closest point
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Collision detected
    if (distance < ball.radius) {
        ball.speedX = -ball.speedX * 1.05; // Increase speed slightly
        ball.speedY += (ball.y - (paddle.y + paddle.height / 2)) * 0.08; // Add spin
        
        // Limit speed
        const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        if (speed > ball.maxSpeed) {
            ball.speedX = (ball.speedX / speed) * ball.maxSpeed;
            ball.speedY = (ball.speedY / speed) * ball.maxSpeed;
        }
        
        // Push ball away from paddle
        ball.x += ball.speedX;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 8;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    
    // Check for win condition
    if (playerScore >= 11 || computerScore >= 11) {
        gameRunning = false;
        const winner = playerScore >= 11 ? 'You Win!' : 'Computer Wins!';
        setTimeout(() => {
            alert(`Game Over! ${winner}\nPlayer: ${playerScore} | Computer: ${computerScore}`);
        }, 500);
    }
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameRunning = true;
    
    paddle.y = canvas.height / 2 - 40;
    computerPaddle.y = canvas.height / 2 - 40;
    
    resetBall();
    
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) {
        return;
    }
    
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();
