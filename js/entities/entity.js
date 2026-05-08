import { Bullet } from './bullet.js';

export class Enemy {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 16; this.height = 16;
        this.speed = 40;
        this.health = 3;
        this.active = true;
        this.shootTimer = 0;
        this.bombTimer = 0;
    }

    update(deltaTime, level, player, bulletsArray) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        let nextX = this.x + Math.cos(angle) * this.speed * deltaTime;
        let nextY = this.y + Math.sin(angle) * this.speed * deltaTime;

        if (level.getTileAt(nextX, this.y) !== 1) this.x = nextX;
        if (level.getTileAt(this.x, nextY) !== 1) this.y = nextY;

        this.shootTimer += deltaTime;
        this.bombTimer += deltaTime;

        if (this.shootTimer >= 2) {
            this.shootTimer = 0;
            bulletsArray.push(new Bullet(this.x + 8, this.y + 8, player.x + 8, player.y + 8, 100, true));
        }

        if (this.bombTimer >= 5) {
            this.bombTimer = 0;
            bulletsArray.push(new Bullet(this.x, this.y, 0, 0, 0, true, true)); 
        }
    }

    draw(ctx, spritesheet) {
        if (spritesheet) {
            const sourceX = 96; // Skeleton coordinate X
            const sourceY = 16; // Skeleton coordinate Y
            const sourceSize = 16;

            ctx.drawImage(
                spritesheet, 
                sourceX, sourceY, sourceSize, sourceSize, 
                this.x, this.y, this.width, this.height   
            );
        } else {
            ctx.fillStyle = '#8800ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}