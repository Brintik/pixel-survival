export class Bullet {
    constructor(x, y, targetX, targetY, speed, isEnemy, isBomb = false) {
        this.x = x; this.y = y;
        this.width = isBomb ? 16 : 4;
        this.height = isBomb ? 16 : 4;
        this.isEnemy = isEnemy;
        this.isBomb = isBomb;
        this.frameX = 0;
        this.frameTimer = 0;
        this.active = true;
        this.damage = 1;

        if (this.isBomb) {
            // --- BOMB PROJECTILE LOGIC ---
            const angle = Math.atan2(targetY - y, targetX - x);
            this.vx = Math.cos(angle) * (speed * 0.6); // Slightly slower than a bullet
            this.vy = Math.sin(angle) * (speed * 0.6);
            
            // Remember the exact spot the player was standing!
            this.targetX = targetX;
            this.targetY = targetY;
            
            this.hasLanded = false;
            this.timer = 1; // The 1 second fuse!
        } else {
            const angle = Math.atan2(targetY - y, targetX - x);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    update(deltaTime, level) {
        if (this.isBomb) {
            // ALWAYS blink while traveling AND waiting!
            this.frameTimer += deltaTime;
            if (this.frameTimer >= 0.15) { // Blink slightly faster to look dangerous
                this.frameX = (this.frameX + 1) % 2; 
                this.frameTimer = 0;
            }

            if (!this.hasLanded) {
                // Fly towards the target
                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;
                
                // Check distance to the exact spot the player was standing
                let dist = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
                if (dist < 10) { 
                    // We hit the target spot! Stop moving.
                    this.hasLanded = true; 
                    this.vx = 0; 
                    this.vy = 0; 
                }
            } else {
                // We landed! Countdown the 1 second fuse!
                this.timer -= deltaTime;
            }
        } else {
            // Normal bullet logic
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
            if (level.getTileAt(this.x, this.y) === 1) this.active = false;
        }
    }

    update(deltaTime, level) {
        if (this.isBomb) {
            this.timer -= deltaTime;
            
            // --- NEW: ANIMATE THE BOMB ---
            this.frameTimer += deltaTime;
            if (this.frameTimer >= 0.2) { // Flashes every 0.2 seconds
                this.frameX = (this.frameX + 1) % 2; // Swaps between frame 0 and frame 1
                this.frameTimer = 0;
            }
        }
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        if (level.getTileAt(this.x, this.y) === 1) this.active = false;
    }
    draw(ctx, spritesheet) {
        if (this.isBomb) {
            // --- 💣 ANIMATED BOMB LOGIC ---
            const frameWidth = 16;
            const frameHeight = 16;
            
            // SNAPPED TO 16x16 GRID! (Was 659, 252)
            const baseSourceX = 659; 
            const baseSourceY = 252; 
            
            const sourceX = baseSourceX + (this.frameX * frameWidth);
            const sourceY = baseSourceY;
            
            ctx.drawImage(spritesheet, sourceX, sourceY, frameWidth, frameHeight, this.x, this.y, this.width, this.height);
            
        } else {
            // --- 🔫 STANDARD BULLET LOGIC ---
            if (spritesheet) {
                // SNAPPED TO 8x8 GRID! (Was 533, 34)
                const bulletSourceX = 552; 
                const bulletSourceY = 35; 
                
                const clipWidth = 8;  
                const clipHeight = 8; 
                
                const scale = 1; 
                const drawWidth = clipWidth * scale;
                const drawHeight = clipHeight * scale;
                
                const drawX = this.x + (this.width / 2) - (drawWidth / 2);
                const drawY = this.y + (this.height / 2) - (drawHeight / 2);

                ctx.drawImage(spritesheet, bulletSourceX, bulletSourceY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight);
            } else {
                ctx.fillStyle = this.isEnemy ? 'red' : 'yellow';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
}