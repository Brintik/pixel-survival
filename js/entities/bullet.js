export class Bullet {
    constructor(x, y, targetX, targetY, speed, isEnemy, isBomb = false) {
        this.x = x; this.y = y;
        this.width = isBomb ? 16 : 4;
        this.height = isBomb ? 16 : 4;
        this.isEnemy = isEnemy;
        this.isBomb = isBomb;
        this.active = true;
        this.damage = 1;

        if (this.isBomb) {
            this.vx = 0; this.vy = 0;
            this.timer = 4; 
        } else {
            const angle = Math.atan2(targetY - y, targetX - x);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    update(deltaTime, level) {
        if (this.isBomb) {
            this.timer -= deltaTime;
            return;
        }
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        if (level.getTileAt(this.x, this.y) === 1) this.active = false;
    }
    draw(ctx, spritesheet) {
        if (this.isBomb) {
            // Keep bombs flashing red/white
            ctx.fillStyle = Math.floor(this.timer * 4) % 2 === 0 ? '#ff0000' : '#ffffff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (spritesheet) {
            // Draw your custom bullet sprite!
            const sourceX = 544; 
            const sourceY = 32; 
            
            ctx.drawImage(
                spritesheet, 
                sourceX, sourceY, 16, 16, 
                this.x, this.y, 16, 16 // Drawing it slightly larger (16x16) so you can see the detail
            );
        } else {
            // Fallback color
            ctx.fillStyle = this.isEnemy ? '#ff5500' : '#ffff00'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}