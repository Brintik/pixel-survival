import { Bullet } from './bullet.js';
import { playSound } from '../engine/audio.js';

export class Enemy {
    constructor(x, y) {
        this.x = x; this.y = y;
        
        // Match the player's 24x24 physics hitbox so they don't clip into walls
        this.width = 24; 
        this.height = 24;
        
        this.speed = 40;
        this.health = 3;
        this.active = true;
        this.shootTimer = 0;
        this.bombCooldown = 0;

        // --- 8-FRAME ANIMATION VARIABLES ---
        this.frameX = 0;
        this.frameTimer = 0;
        this.facingLeft = false; 

        // Pick a random number: 1 (Skeleton) or 2 (Goblin)
        this.type = Math.random() < 0.5 ? 1 : 2;
    }

    update(deltaTime, level, player, bulletsArray) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        let nextX = this.x + Math.cos(angle) * this.speed * deltaTime;
        let nextY = this.y + Math.sin(angle) * this.speed * deltaTime;

        // --- DIRECTION TRACKING ---
        // If the player is to the left of the enemy, turn left!
        if (player.x < this.x) {
            this.facingLeft = true;
        } else {
            this.facingLeft = false;
        }

        // AABB Sliding Collision (Same as the player!)
        if (!this.checkCollision(nextX, this.y, level)) this.x = nextX;
        if (!this.checkCollision(this.x, nextY, level)) this.y = nextY;

        // --- 8-FRAME ANIMATION TIMER ---
        this.frameTimer += deltaTime;
        if (this.frameTimer >= 0.1) { // Skeletons walk slightly slower than the player
            this.frameX = (this.frameX + 1) % 8;
            this.frameTimer = 0;
        }

        this.shootTimer += deltaTime;
        this.bombCooldown += deltaTime;

        // Center coordinates for shooting out of their chest
        let centerX = this.x + (this.width / 2);
        let centerY = this.y + (this.height / 2);
        let playerCenterX = player.x + (player.width / 2);
        let playerCenterY = player.y + (player.height / 2);

        if (this.shootTimer >= 2) {
            this.shootTimer = 0;
            bulletsArray.push(new Bullet(centerX, centerY, playerCenterX, playerCenterY, 100, true));
        }

        // --- NEW BOMB LOGIC: Proximity Check! ---

        // Calculate distance to player using the Pythagorean theorem
        let distToPlayer = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));

        // Only throw a bomb if the player is within 250 pixels!
        if (this.bombCooldown >= 6 && distToPlayer < 250) {
            this.bombCooldown = 0; // Reset the 4-second cooldown
            // Pass the player's exact location at this moment so the bomb knows where to land
            bulletsArray.push(new Bullet(this.x, this.y, player.x, player.y, 200, true, true));
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
            // Tweak these to align the skeleton sprite into the red box
            const nudgeX = 0; 
            const nudgeY = 38; 

            // If the new Goblin sprite needs different nudging to fit in the 
            // physics box, you can safely change his numbers right here!
            if (this.type === 3) {
                nudgeX = 0;
                nudgeY = 38; 
            }

            drawX += nudgeX;
            drawY += nudgeY;

            // --- 3. THE SPRITE FLIP TRICK ---
            ctx.save(); 

            if (this.facingLeft) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    spritesheet, 
                    sourceX, sourceY, frameWidth, frameHeight, 
                    -drawX - drawWidth, drawY, drawWidth, drawHeight   
                );
            } else {
                ctx.drawImage(
                    spritesheet, 
                    sourceX, sourceY, frameWidth, frameHeight, 
                    drawX, drawY, drawWidth, drawHeight   
                );
            }

            ctx.restore(); 
            
            // --- RED BOX CALIBRATION MODE ---
            // Remove the "//" from the next two lines so you can see the enemy physics body.
            // Change nudgeX and nudgeY until the skeleton sits perfectly inside the red box!
            // ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            // ctx.strokeRect(this.x, this.y, this.width, this.height);

        } else {
            ctx.fillStyle = '#8800ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}