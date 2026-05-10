export class Item {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.width = 16; this.height = 16; // Increased size to fit the sprites perfectly
        this.type = type; 
        this.active = true;

        // If it's fruit (health), pick a random number between 0 and 2 
        // to decide WHICH veggie sprite to draw!
        // Pick a random number between 0 and 1 for your 2 veggie buffs
        this.veggieVariant = Math.floor(Math.random() * 2);
    }

    draw(ctx, spritesheet) {
        if (spritesheet) {
            let sourceX = 0;
            let sourceY = 0;

            if (this.type === 'coin') {
                sourceX = 608; sourceY = 480; // Your new Coin coordinate
            } 
            else if (this.type === 'upgrade') {
                sourceX = 864; sourceY = 400; // (I left the old sword coordinate here!)
            } 
            else if (this.type === 'fruit') {
                // Pick between your 2 new Health Buff veggies!
                if (this.veggieVariant === 0) {
                    sourceX = 816; sourceY = 160; // Health Buff 1
                } else {
                    sourceX = 880; sourceY = 160; // Health Buff 2
                }
            } 
            else if (this.type === 'ammo') {
                sourceX = 608; sourceY = 480; // Reusing the coin sprite for ammo drops
            }

            ctx.drawImage(
                spritesheet,
                sourceX, sourceY, 16, 16,
                this.x, this.y, this.width, this.height
            );

        } else {
            // Fallback colors just in case the image doesn't load
            if (this.type === 'coin') ctx.fillStyle = '#ffd700'; 
            if (this.type === 'fruit') ctx.fillStyle = '#ff0055'; 
            if (this.type === 'upgrade') ctx.fillStyle = '#00ffff'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}