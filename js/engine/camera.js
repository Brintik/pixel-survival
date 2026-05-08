export class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    follow(target, mapWidth, mapHeight) {
        this.x = target.x + (target.width / 2) - (this.width / 2);
        this.y = target.y + (target.height / 2) - (this.height / 2);

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > mapWidth - this.width) this.x = mapWidth - this.width;
        if (this.y > mapHeight - this.height) this.y = mapHeight - this.height;
    }
}