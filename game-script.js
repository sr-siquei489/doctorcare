// Game State
const GameState = {
    TITLE: 'title',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

let currentState = GameState.TITLE;
let score = 0;
let lives = 3;
let level = 1;

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Set canvas size
function resizeCanvas() {
    if (canvas) {
        canvas.width = Math.min(1000, window.innerWidth - 40);
        canvas.height = Math.min(600, window.innerHeight - 200);
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Objects
class Player {
    constructor() {
        this.width = 30;
        this.height = 40;
        this.x = 50;
        this.y = canvas.height - this.height - 50;
        this.velocityY = 0;
        this.velocityX = 0;
        this.speed = 5;
        this.jumpPower = -15;
        this.gravity = 0.6;
        this.isJumping = false;
        this.direction = 1; // 1 = right, -1 = left
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;

        // Ground collision
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - this.height - 50;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Platform collision
        platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isJumping = false;
                }
            }
        });

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }

    checkCollision(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    draw() {
        // Player body (Eleven inspired - pink jacket)
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(this.x, this.y + 15, this.width, 25);

        // Head
        ctx.fillStyle = '#ffd4a3';
        ctx.fillRect(this.x + 7, this.y, 16, 18);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 6, 3, 3);
        ctx.fillRect(this.x + 17, this.y + 6, 3, 3);

        // Legs
        ctx.fillStyle = '#4169e1';
        ctx.fillRect(this.x + 7, this.y + 32, 7, 8);
        ctx.fillRect(this.x + 16, this.y + 32, 7, 8);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        // Platform with Stranger Things aesthetic
        ctx.fillStyle = '#2d1b2e';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#ff0040';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Glowing effect
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff0040';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(x, y) {
        this.width = 35;
        this.height = 45;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.direction = -1;
        this.minX = x - 150;
        this.maxX = x + 150;
    }

    update() {
        this.x += this.speed * this.direction;

        // Reverse direction at boundaries
        if (this.x <= this.minX || this.x >= this.maxX) {
            this.direction *= -1;
        }
    }

    draw() {
        // Demogorgon-inspired enemy
        ctx.fillStyle = '#8b0000';

        // Body
        ctx.fillRect(this.x, this.y + 15, this.width, 30);

        // Head/mouth opening
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(this.x + 8 + i * 4, this.y + 6, 2, 8);
        }

        // Eyes (black holes)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 3, 4, 4);
        ctx.fillRect(this.x + 23, this.y + 3, 4, 4);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.angle = 0;
    }

    update() {
        this.angle += 0.1;
    }

    draw() {
        if (!this.collected) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.angle);

            // Waffle (Eggo) collectible
            ctx.fillStyle = '#f4d03f';
            ctx.fillRect(-10, -10, 20, 20);

            // Grid pattern
            ctx.strokeStyle = '#8b6914';
            ctx.lineWidth = 1;
            for (let i = -10; i <= 10; i += 5) {
                ctx.beginPath();
                ctx.moveTo(i, -10);
                ctx.lineTo(i, 10);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(-10, i);
                ctx.lineTo(10, i);
                ctx.stroke();
            }

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f4d03f';
            ctx.strokeStyle = '#f4d03f';
            ctx.lineWidth = 2;
            ctx.strokeRect(-10, -10, 20, 20);
            ctx.shadowBlur = 0;

            ctx.restore();
        }
    }
}

// Game objects
let player;
let platforms = [];
let enemies = [];
let collectibles = [];
let keys = {};

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (currentState === GameState.TITLE && e.code === 'Space') {
        startGame();
    } else if (currentState === GameState.GAME_OVER && e.code === 'Space') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function handleInput() {
    if (currentState !== GameState.PLAYING) return;

    player.velocityX = 0;

    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
        player.direction = -1;
    }
    if (keys['ArrowRight']) {
        player.velocityX = player.speed;
        player.direction = 1;
    }
    if (keys['Space']) {
        player.jump();
    }
}

function initLevel() {
    platforms = [];
    enemies = [];
    collectibles = [];

    // Create platforms based on level
    const platformCount = 5 + level;
    const spacing = canvas.width / (platformCount + 1);

    for (let i = 1; i <= platformCount; i++) {
        const x = spacing * i - 50;
        const y = canvas.height - 100 - Math.random() * 300;
        const width = 80 + Math.random() * 40;
        platforms.push(new Platform(x, y, width, 15));
    }

    // Create enemies
    const enemyCount = 2 + Math.floor(level / 2);
    for (let i = 0; i < enemyCount; i++) {
        const platformIndex = Math.floor(Math.random() * platforms.length);
        const platform = platforms[platformIndex];
        enemies.push(new Enemy(platform.x + 20, platform.y - 50));
    }

    // Create collectibles
    const collectibleCount = 5 + level * 2;
    for (let i = 0; i < collectibleCount; i++) {
        const x = Math.random() * (canvas.width - 40) + 20;
        const y = Math.random() * (canvas.height - 200) + 50;
        collectibles.push(new Collectible(x, y));
    }
}

function startGame() {
    currentState = GameState.PLAYING;
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    player = new Player();
    initLevel();
    gameLoop();
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    updateHUD();
    document.getElementById('gameOver').classList.add('hidden');
    player = new Player();
    initLevel();
    currentState = GameState.PLAYING;
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function nextLevel() {
    level++;
    updateHUD();
    player = new Player();
    initLevel();
}

function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function checkCollisions() {
    // Check enemy collisions
    enemies.forEach(enemy => {
        if (player.checkCollision(enemy)) {
            // Check if player jumped on enemy
            if (player.velocityY > 0 && player.y + player.height - 10 < enemy.y + enemy.height / 2) {
                // Kill enemy
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                score += 50;
                player.velocityY = -10; // Bounce
            } else {
                // Player hit
                lives--;
                if (lives <= 0) {
                    gameOver();
                } else {
                    player.x = 50;
                    player.y = canvas.height - player.height - 50;
                    player.velocityY = 0;
                }
                updateHUD();
            }
        }
    });

    // Check collectible collisions
    collectibles.forEach(collectible => {
        if (!collectible.collected && player.checkCollision(collectible)) {
            collectible.collected = true;
            score += 10;
            updateHUD();
        }
    });

    // Check if level complete
    const allCollected = collectibles.every(c => c.collected);
    if (allCollected && collectibles.length > 0) {
        score += 100 * level;
        nextLevel();
    }

    // Fall off screen
    if (player.y > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameOver();
        } else {
            player.x = 50;
            player.y = canvas.height - player.height - 50;
            player.velocityY = 0;
        }
        updateHUD();
    }
}

function drawBackground() {
    // Dark background with particles
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floating particles (Upside Down aesthetic)
    const time = Date.now() * 0.001;
    for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.5 + i) * 100 + canvas.width / 2 + i * 40) % canvas.width;
        const y = (Math.cos(time * 0.3 + i) * 50 + 100 + i * 25) % canvas.height;

        ctx.fillStyle = `rgba(255, 0, 64, ${0.1 + Math.sin(time + i) * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#1a0a0f';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.strokeStyle = '#ff0040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();
}

function gameLoop() {
    if (currentState !== GameState.PLAYING) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    handleInput();

    // Update
    player.update();
    enemies.forEach(enemy => enemy.update());
    collectibles.forEach(collectible => collectible.update());

    // Draw
    platforms.forEach(platform => platform.draw());
    collectibles.forEach(collectible => collectible.draw());
    enemies.forEach(enemy => enemy.draw());
    player.draw();

    // Check collisions
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Initialize
updateHUD();
