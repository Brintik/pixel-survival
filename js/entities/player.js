import { Bullet } from './bullet.js';
import { playSound } from '../engine/audio.js';
import { keys, mouse, joyMove } from '../engine/input.js';

export class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        
        // --- HITBOX FIX ---
        // Increased from 16x16 to 24x24 to match the scaled-up visual sprite!
        // This prevents the visual sprite from clipping deep into walls.
        this.width = 24; 
        this.height = 24;
        
        this.speed = 100; 
        
        this.health = 10;
        this.maxHealth = 10;
        this.ammo = 20;
        this.coins = 0;
        this.gunLevel = 1;
        this.shootCooldown = 0;

        this.frameX = 0;       
        this.frameTimer = 0;   
        this.isMoving = false; 
        this.facingLeft = false;
    }

    update(deltaTime, level, camera, bullets) {
        let nextX = this.x; let nextY = this.y;
        this.isMoving = false; 

        // --- MOVEMENT UPGRADE ---
        // Now checks Keyboard OR Virtual Joystick!
        if (keys.ArrowUp || keys.KeyW || joyMove.y < -0.2) { nextY -= this.speed * deltaTime; this.isMoving = true; }
        if (keys.ArrowDown || keys.KeyS || joyMove.y > 0.2) { nextY += this.speed * deltaTime; this.isMoving = true; }
        if (keys.ArrowLeft || keys.KeyA || joyMove.x < -0.2) { 
            nextX -= this.speed * deltaTime; 
            this.isMoving = true; 
            this.facingLeft = true; 
        }
        if (keys.ArrowRight || keys.KeyD || joyMove.x > 0.2) { 
            nextX += this.speed * deltaTime; 
            this.isMoving = true; 
            this.facingLeft = false; 
        }

        // AABB Sliding Collision
        if (!this.checkCollision(nextX, this.y, level)) this.x = nextX;
        if (!this.checkCollision(this.x, nextY, level)) this.y = nextY;

        // Map Boundary Clamping
        if (this.x < 0) this.x = 0; if (this.y < 0) this.y = 0;
        if (this.x + this.width > level.width) this.x = level.width - this.width;
        if (this.y + this.height > level.height) this.y = level.height - this.height;

        // Animation Timer
        if (this.isMoving) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= 0.08) { 
                this.frameX = (this.frameX + 1) % 8; 
                this.frameTimer = 0;
            }
        } else {
            this.frameX = 0; 
            this.frameTimer = 0;
        }

        // --- THE SHOOTING TIMER TICK! ---
        if (this.shootCooldown > 0) this.shootCooldown -= deltaTime;

        // --- SHOOTING UPGRADE ---
        let fireRate = 0.5 / this.gunLevel;
        
        // 1. THE RELOAD LOGIC:
        // If they try to shoot but have 0 ammo, check if they have coins!
        if (mouse.isDown && this.ammo <= 0 && this.coins > 0 && this.shootCooldown <= 0) {
            this.coins -= 1;
            this.ammo += 15; // Give them a fresh clip of 15 bullets!
            this.shootCooldown = fireRate; // Add a tiny delay before the next shot fires
            playSound('powerup', 0.5); // Play a sound so they know they reloaded
        }

        // 2. THE FIRING LOGIC:
        // Now checks Mouse Click OR Mobile Screen Tap/Hold!
        if (mouse.isDown && this.shootCooldown <= 0 && this.ammo > 0) {
            this.ammo--;
            this.shootCooldown = fireRate;
            
            let centerX = this.x + (this.width / 2);
            let centerY = this.y + (this.height / 2);
            
            // PC mouse target OR Mobile Tap target
            let targetX = mouse.x + camera.x;
            let targetY = mouse.y + camera.y;
            
            bullets.push(new Bullet(centerX, centerY, targetX, targetY, 250, false));
            playSound('shoot', 0.3); 
        }
    }

    checkCollision(newX, newY, level) {
        const left = newX; const right = newX + this.width - 0.1; 
        const top = newY; const bottom = newY + this.height - 0.1;
        return (level.getTileAt(left, top) === 1 || level.getTileAt(right, top) === 1 ||
                level.getTileAt(left, bottom) === 1 || level.getTileAt(right, bottom) === 1);
    }

    draw(ctx, spritesheet) {
        if (spritesheet) {
            const frameWidth = spritesheet.width / 8;
            const frameHeight = spritesheet.height;
            const sourceX = this.frameX * frameWidth;
            const sourceY = 0; 

            // Scale to dial in the visual size
            const scale = 1.5; 
            const drawWidth = frameWidth * scale;
            const drawHeight = frameHeight * scale;

            // 1. Mathematically center the image over the physics hitbox
            let drawX = this.x + (this.width / 2) - (drawWidth / 2);
            let drawY = this.y + this.height - drawHeight;

            // --- 2. THE VISUAL NUDGE ---
            // Tweak these two numbers to offset the invisible padding in your image!
            // Positive X moves right, Negative X moves left.
            // Positive Y moves down, Negative Y moves up.
            const nudgeX = 0; 
            const nudgeY = 38; // I added 10 here to push him down as a starting guess

            drawX += nudgeX;
            drawY += nudgeY;

            // --- THE SPRITE FLIP TRICK ---
            ctx.save(); // Save the canvas state before we mess with it

            if (this.facingLeft) {
                // If facing left, flip the canvas horizontally
                ctx.scale(-1, 1);
                // Draw the image backwards (at negative X) so it mirrors perfectly in place!
                ctx.drawImage(
                    spritesheet, 
                    sourceX, sourceY, frameWidth, frameHeight, 
                    -drawX - drawWidth, drawY, drawWidth, drawHeight   
                );
            } else {
                // If facing right, draw normally
                ctx.drawImage(
                    spritesheet, 
                    sourceX, sourceY, frameWidth, frameHeight, 
                    drawX, drawY, drawWidth, drawHeight   
                );
            }

            ctx.restore(); // Restore the canvas back to normal so the UI doesn't flip!
            
            // --- RED BOX CALIBRATION MODE ---
            // Remove the "//" from the next two lines so you can see your true physics body.
            // Change nudgeX and nudgeY until the character sits perfectly inside the red box!
            //ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            //ctx.strokeRect(this.x, this.y, this.width, this.height);

        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}