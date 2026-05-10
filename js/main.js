import { Player } from './entities/player.js';
import { Level } from './scenes/level.js';
import { Camera } from './engine/camera.js';
import { Enemy } from './entities/enemy.js';
import { Item } from './entities/item.js';
import { loadAllImages, images } from './engine/loader.js';
import { initAudio, playSound } from './engine/audio.js';
import { initMobileControls } from './engine/input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let ammoEventCount = 0;
let ammoDropTimer = 0;
let isWaitingForAmmo = false;

canvas.width = 640;
canvas.height = 480;


// Function to lock mobile screens to landscape
async function goFullscreenAndLandscape() {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
        }
    } catch (err) {
        console.log("Fullscreen/Landscape lock failed or not supported.");
    }
}

function getSafeSpawn(level) {
    let safe = false;
    let spawnX = 0;
    let spawnY = 0;
    while (!safe) {
        let col = Math.floor(Math.random() * level.map[0].length);
        let row = Math.floor(Math.random() * level.map.length);
        // Guarantee it only spawns on 0 (Grass), avoiding all crates, trees, and walls!
        if (level.map[row][col] === 0) {
            safe = true; 
            spawnX = col * level.tileSize;
            spawnY = row * level.tileSize;
        }
    }
    return { x: spawnX, y: spawnY };
}

const level = new Level();
const playerStartLoc = getSafeSpawn(level);
const player = new Player(playerStartLoc.x, playerStartLoc.y);
const camera = new Camera(canvas.width, canvas.height);

let bullets = [];
let items = [];
let enemies = [];
let explosions = [];
let waveNumber = 0;
let waveTimer = 0;
let maxWaveTime = 0;
let lastTime = 0;

// --- GAME STATE & MENUS ---
let gameState = 'START'; // Can be 'START', 'PLAYING', or 'GAMEOVER'

function resetGame() {
    // 1. Reset Player
    let safeSpawn = getSafeSpawn(level);
    player.x = safeSpawn.x;
    player.y = safeSpawn.y;
    player.health = player.maxHealth;
    player.ammo = 20;
    player.coins = 0;
    player.gunLevel = 1;
    
    // 2. Wipe the board clean
    bullets = [];
    items = [];
    enemies = [];
    explosions = [];
    waveNumber = 0;
    ammoEventCount = 0;
    isWaitingForAmmo = false;
    
    // 3. Hide the Game Over screen and start!
    document.getElementById('game-over-screen').classList.add('hidden');
    gameState = 'PLAYING';
    startNextWave();
}

// Button Listeners
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    
    // --- STRICT MOBILE CHECK ---
    // This string specifically looks for real phone operating systems!
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        initMobileControls(); // Only spawn joysticks on real phones
        goFullscreenAndLandscape(); // Only force fullscreen on real phones
    }
    
    gameState = 'PLAYING';
    startNextWave();
});

// --- PAUSE LOGIC ---
function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pause-screen').classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        document.getElementById('pause-screen').classList.add('hidden');
        
        // CRITICAL: Reset lastTime so deltaTime doesn't jump forward 
        // and instantly spawn a bunch of enemies when you unpause!
        lastTime = performance.now(); 
    }
}

// --- MOBILE GESTURES (Double Tap & Swipe Down) ---
let lastTapTime = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    // 1. Record where the finger touched the screen (for swiping down)
    touchStartY = e.changedTouches[0].clientY; 

    // 2. Check for Double Tap (two taps within 300 milliseconds)
    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTapTime;
    
    if (tapGap > 0 && tapGap < 300) {
        // Double tap confirmed! Make sure we are on a phone before entering fullscreen
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && gameState === 'PLAYING') {
            goFullscreenAndLandscape();
        }
    }
    lastTapTime = currentTime;
}, { passive: false });

window.addEventListener('touchend', (e) => {
    let touchEndY = e.changedTouches[0].clientY;
    
    // 3. Exit Fullscreen if they swiped down significantly (more than 80px) 
    //    AND they started the swipe from the very top edge of the screen (top 50px).
    if (touchStartY < 50 && (touchEndY - touchStartY > 80)) {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Listen for physical mouse clicks on the buttons
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('resume-btn').addEventListener('click', togglePause);

document.getElementById('pause-restart-btn').addEventListener('click', () => {
    // 1. Hide the pause menu overlay
    document.getElementById('pause-screen').classList.add('hidden');
    // 2. Trigger your existing Game Over reset function!
    resetGame();
});

// Listen for keyboard shortcuts (P or Escape)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        // Only allow pausing if we aren't dead or on the start screen
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            togglePause();
        }
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    resetGame();
});

function startNextWave() {
    waveNumber++;
    waveTimer = 0;
    maxWaveTime = 30 + (2 * waveNumber);

    let enemyCount = 1;
    if (waveNumber === 1) {
        enemyCount = 1;
    } else if (waveNumber >= 2 && waveNumber <= 4) {
        enemyCount = Math.floor(Math.random() * 3) + 2; 
    } else {
        let baseAmount = Math.floor(Math.random() * 3) + 2;
        let scalingBonus = Math.floor((waveNumber - 4) / 2);
        enemyCount = baseAmount + scalingBonus;
    }

    for (let i = 0; i < enemyCount; i++) {
        let randomLoc = getSafeSpawn(level);
        enemies.push(new Enemy(randomLoc.x, randomLoc.y));
    }
}

function checkOverlap(r1, r2) {
    return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
}

function gameLoop(timestamp) {
    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (deltaTime > 0.1) deltaTime = 0.1;

    // ONLY update and draw the game if we are actively playing!
    if (gameState === 'PLAYING') {
        
        waveTimer += deltaTime;
        if (enemies.length === 0 || waveTimer >= maxWaveTime) {
            startNextWave();
        }

        // --- EMERGENCY AMMO DROP LOGIC ---
        // If out of ammo and coins, start the timer!
        if (player.ammo <= 0 && player.coins <= 0 && !isWaitingForAmmo) {
            isWaitingForAmmo = true;
            // Base 30 seconds + 10 extra seconds for every previous drop
            ammoDropTimer = 30 + (10 * ammoEventCount); 
        }

        // Tick the timer down
        if (isWaitingForAmmo) {
            ammoDropTimer -= deltaTime;
            if (ammoDropTimer <= 0) {
                // Timer finished! Spawn the emergency ammo!
                let randomLoc = getSafeSpawn(level);
                items.push(new Item(randomLoc.x, randomLoc.y, 'ammo'));
                
                ammoEventCount++; // Increase the penalty for next time
                isWaitingForAmmo = false; // Reset the flag
            }
        }

        player.update(deltaTime, level, camera, bullets);
        camera.follow(player, level.width, level.height);

        enemies.forEach(enemy => enemy.update(deltaTime, level, player, bullets));
        bullets.forEach(bullet => bullet.update(deltaTime, level));

        bullets.forEach(bullet => {
            if (!bullet.active || bullet.isBomb) return;
            if (bullet.isEnemy) {
                if (checkOverlap(bullet, player)) {
                    player.health -= bullet.damage;
                    bullet.active = false;
                    playSound('hit', 0.6);
                }
            } else {
                enemies.forEach(enemy => {
                    if (checkOverlap(bullet, enemy)) {
                        enemy.health -= bullet.damage;
                        bullet.active = false;
                    }
                });
            }
        });

        bullets.forEach(bullet => {
            if (bullet.isBomb && bullet.timer <= 0 && bullet.active) {
                bullet.active = false; 
                playSound('explosion', 0.7);
                
                let centerX = bullet.x + (bullet.width / 2);
                let centerY = bullet.y + (bullet.height / 2);

                // --- 1. SPAWN THE BIGGER VISUAL BLAST ---
                explosions.push({
                    x: centerX,
                    y: centerY,
                    radius: 10,       
                    timer: 0.5,       // Lasts for half a second
                    maxTimer: 0.5
                });

                // --- 2. THE PERFECT CIRCLE COLLISION ---
                // We define the exact maximum radius of the blast (100 pixels!)
                let maxBlastRadius = 100;
                
                let playerCenterX = player.x + (player.width / 2);
                let playerCenterY = player.y + (player.height / 2);
                
                // Use the Pythagorean theorem to find the exact distance!
                let distToPlayer = Math.sqrt(Math.pow(playerCenterX - centerX, 2) + Math.pow(playerCenterY - centerY, 2));

                // If the player is inside the blast circle, they take damage!
                if (distToPlayer <= maxBlastRadius) {
                    player.health -= 2;
                    playSound('hit', 0.6);
                }
            }
        });

        items.forEach(item => {
            if (checkOverlap(player, item)) {
                item.active = false;
                if (item.type === 'coin') { player.coins++; playSound('coin', 0.4); }
                if (item.type === 'fruit' && player.health < player.maxHealth) { player.health++; playSound('crunch', 0.5); }
                if (item.type === 'upgrade') { player.gunLevel++; playSound('powerup', 0.6); }
                if (item.type === 'ammo') { player.ammo += 15; playSound('powerup', 0.6); }
            }
        });

        enemies = enemies.filter(enemy => {
            if (enemy.health <= 0) {
                let roll = Math.random();
                if (roll < 0.5) items.push(new Item(enemy.x, enemy.y, 'coin'));
                else if (roll < 0.8) items.push(new Item(enemy.x, enemy.y, 'fruit'));
                else items.push(new Item(enemy.x, enemy.y, 'upgrade'));
                return false;
            }
            return true;
        });
        
        bullets = bullets.filter(b => b.active);
        items = items.filter(i => i.active);

        // --- DRAWING ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.x, -camera.y); 

        level.draw(ctx, images.sunny, images.forest);
        items.forEach(item => item.draw(ctx, images.sunny)); 
        // Check the enemy type and pass the correct spritesheet!
        enemies.forEach(enemy => {
            const enemyImage = enemy.type === 1 ? images.enemy_walk : images.enemy2_walk;
            enemy.draw(ctx, enemyImage);
        });
        bullets.forEach(bullet => bullet.draw(ctx, images.sunny));
        player.draw(ctx, images.player_walk);

        // --- NEW: DRAW EXPLOSIONS ---
        explosions.forEach(exp => {
            exp.timer -= deltaTime;
            exp.radius += 180 * deltaTime; // The blast wave expands rapidly to exactly 100px!

            // Calculate opacity (alpha) so it fades out as the timer hits 0
            let alpha = Math.max(0, exp.timer / exp.maxTimer);

            // 1. The Outer Orange/Red Smoke (Slightly larger and more transparent)
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.7})`; 
            ctx.fill();

            // 2. The Inner Hot Yellow Core (Smaller and brighter)
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`; 
            ctx.fill();
        });

        // Cleanup: Remove explosions that have completely faded away
        explosions = explosions.filter(exp => exp.timer > 0);

        ctx.restore();

        // --- STATIC UI ---
        document.getElementById('ui-ammo').innerText = `Ammo: ${player.ammo} (Coins: ${player.coins})`;
        document.getElementById('ui-gun').innerText = `Gun Lvl: ${player.gunLevel}`;
        document.getElementById('ui-health').innerText = `❤️ X ${player.health}`;
        document.getElementById('ui-wave').innerText = `Wave: ${waveNumber}`;
        let timeLeft = Math.max(0, Math.ceil(maxWaveTime - waveTimer));
        document.getElementById('ui-timer').innerText = `Next Wave: ${timeLeft}s`;

        // --- DEATH CHECK ---
        if (player.health <= 0) {
            gameState = 'GAMEOVER';
            document.getElementById('final-wave-text').innerText = `You survived to Wave ${waveNumber}!`;
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }

    requestAnimationFrame(gameLoop);
}

// 100% necessary to load your sprite graphics!
const assetsToLoad = {
    chars: 'assets/images/chars.png',
    sunny: 'assets/images/sunny_16.png',
    forest: 'assets/images/forest_32.png',
    player_walk: 'assets/images/base_walk_strip8.png',
    enemy_walk: 'assets/images/skeleton_walk_strip8.png',
    enemy2_walk: 'assets/images/spr_walk_strip8.png'
};

loadAllImages(assetsToLoad).then(() => {
    console.log("All graphics loaded! Starting game...");
    initAudio();
    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        gameLoop(timestamp);
    });
}).catch(err => {
    console.error("Failed to load images! Check your file paths.", err);
});