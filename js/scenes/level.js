export class Level {
    constructor() {
        this.tileSize = 32;
        this.cols = 40; 
        this.rows = 30; 
        this.map = [];

        for (let row = 0; row < this.rows; row++) {
            let currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                
                // 1. Boundary Walls
                if (row < 3 || row >= this.rows - 3 || col === 0 || col === this.cols - 1) {
                    currentRow.push(1); 
                } 
                // 2. Solid Obstacles (15% chance)
                else if (Math.random() < 0.15) {
                    // Evenly split between Crates (2), Barrels (3), and the New Obstacle (5)
                    let roll = Math.random();
                    if (roll < 0.33) { currentRow.push(2); }
                    else if (roll < 0.66) { currentRow.push(3); }
                    else { currentRow.push(5); }
                } 
                // 3. Walkable Decor: Random grass tufts and planted veggies (10% chance)
                else if (Math.random() < 0.10) {
                    currentRow.push(Math.random() < 0.5 ? 10 : 11);
                }
                // 4. Empty Floor
                else {
                    currentRow.push(0); 
                }
            }
            this.map.push(currentRow);
        }

        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;
    }

    getTileAt(pixelX, pixelY) {
        const col = Math.floor(pixelX / this.tileSize);
        const row = Math.floor(pixelY / this.tileSize);
        if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) return 1;
        
        let tile = this.map[row][col];
        // THE NEW PHYSICS TRICK: Only tiles 1, 2, and 3 are solid! 
        // 10 and 11 (Decor) are treated as 0 (Walkable).
        return (tile > 0 && tile < 10) ? 1 : 0; 
    }

    draw(ctx, tileset) {
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                let tile = this.map[row][col];
                
                if (tileset) {
                    // ALWAYS draw a plain grass floor first to prevent black cracks
                    ctx.drawImage(
                        tileset, 16, 16, 16, 16, 
                        col * this.tileSize, row * this.tileSize, this.tileSize + 1, this.tileSize + 1
                    );

                    // Draw obstacles OR decor on top of the grass
                    if (tile > 0) {
                        let sourceX = 16; let sourceY = 16;
                        
                        if (tile === 1) { 
                            sourceX = 16; sourceY = 64; // Boundary Mud Cliff
                        } else if (tile === 2) { 
                            sourceX = 176; sourceY = 64; // Wooden Crates
                        } else if (tile === 3) { 
                            sourceX = 160; sourceY = 64; // Barrels
                        } else if (tile === 5) { 
                            sourceX = 800; sourceY = 80; //  NEW OBSTACLE - BUSH
                        } else if (tile === 10) { 
                            // DECOR: Mix of Grass 1 and Grass 2
                            if ((row + col) % 2 === 0) { sourceX = 960; sourceY = 224; } 
                            else { sourceX = 976; sourceY = 160; }
                        } 
                        else if (tile === 11) { 
                            // DECOR: Mix of Planted Veggie 1 and 2
                            if ((row + col) % 2 === 0) { sourceX = 848; sourceY = 224; } 
                            else { sourceX = 912; sourceY = 224; }
                        }

                        ctx.drawImage(
                            tileset,
                            sourceX, sourceY, 16, 16,
                            col * this.tileSize, row * this.tileSize, this.tileSize + 1, this.tileSize + 1
                        );
                    }
                }
            }
        }
    }
}