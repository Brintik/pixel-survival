import { keys, mouse } from '../engine/input.js';
import { Bullet } from './bullet.js';
import { playSound } from '../engine/audio.js';

export class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 16; this.height = 16;
        this.speed = 150; 
        
        this.health = 10;
        this.maxHealth = 10;
        this.ammo = 20;
        this.coins = 0;
        this.gunLevel = 1;
        this.shootCooldown = 0;
    }

    update(deltaTime, level, camera, bullets) {
        let nextX = this.x; let nextY = this.y;

        if (keys.ArrowUp || keys.KeyW) nextY -= this.speed * deltaTime;
        if (keys.ArrowDown || keys.KeyS) nextY += this.speed * deltaTime;
        if (keys.ArrowLeft || keys.KeyA) nextX -= this.speed * deltaTime;
        if (keys.ArrowRight || keys.KeyD) nextX += this.speed * deltaTime;

        if (!this.checkCollision(nextX, this.y, level)) this.x = nextX;
        if (!this.checkCollision(this.x, nextY, level)) this.y = nextY;

        if (this.x < 0) this.x = 0; if (this.y < 0) this.y = 0;
        if (this.x + this.width > level.width) this.x = level.width - this.width;
        if (this.y + this.height > level.height) this.y = level.height - this.height;

        if (this.shootCooldown > 0) this.shootCooldown -= deltaTime;

        if (mouse.isDown && this.ammo <= 0 && this.coins > 0 && this.shootCooldown <= 0) {
            this.coins -= 1;
            this.ammo += 15;
        }

        let fireRate = 0.5 / this.gunLevel;
        if (mouse.isDown && this.shootCooldown <= 0 && this.ammo > 0) {
            this.ammo--;
            this.shootCooldown = fireRate;
            let worldMouseX = mouse.x + camera.x;
            let worldMouseY = mouse.y + camera.y;
            bullets.push(new Bullet(this.x + 8, this.y + 8, worldMouseX, worldMouseY, 250, false));
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
            // Top-left human character on the chars.png sheet
            const sourceX = 0;  
            const sourceY = 0; 
            const sourceSize = 16;

            ctx.drawImage(
                spritesheet, 
                sourceX, sourceY, sourceSize, sourceSize, 
                this.x, this.y, this.width, this.height   
            );
        } else {
            ctx.fillStyle = '#0000FF'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}