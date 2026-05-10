export class Level {
    constructor() {
        this.tileSize = 32;
        this.cols = 40; // 1280px wide
        this.rows = 30; // 960px tall
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;
        this.map = [];

        // --- 1. INITIAL RANDOM GENERATION ---
        for (let row = 0; row < this.rows; row++) {
            this.map[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // The indestructible outer boundary walls
                if (row < 3 || row >= this.rows - 3 || col === 0 || col === this.cols - 1) {
                    this.map[row][col] = 1; 
                } else {
                    if (Math.random() < 0.15) { 
                        // Randomly place obstacles (Crates, Barrels, or your new Obstacle)
                        let roll = Math.random();
                        if (roll < 0.33) this.map[row][col] = 2;
                        else if (roll < 0.66) this.map[row][col] = 3;
                        else this.map[row][col] = 5; 
                    // 10% chance to spawn a walkable decoration
                    } else if (Math.random() < 0.1) {
                        
                        // NEW: 50/50 chance to be Grass (10) or Veggies (11)
                        this.map[row][col] = Math.random() < 0.5 ? 10 : 11; 
                        
                    // Otherwise, pure empty grass
                    } else {
                        this.map[row][col] = 0;  // Empty Grass Floor
                    }
                }
            }
        }

        // Check if they are all solid blocks (Any number between 1 and 9 is solid)
                    if (top > 0 && top < 10 && 
                        bottom > 0 && bottom < 10 && 
                        left > 0 && left < 10 && 
                        right > 0 && right < 10) {
                        
                        let removedObstacle = 0;

                        // 1. Find a breakable block and save its identity before smashing it!
                        if (right > 1 && right < 10) { removedObstacle = right; this.map[row][col + 1] = 0; }
                        else if (bottom > 1 && bottom < 10) { removedObstacle = bottom; this.map[row + 1][col] = 0; }
                        else if (left > 1 && left < 10) { removedObstacle = left; this.map[row][col - 1] = 0; }
                        else if (top > 1 && top < 10) { removedObstacle = top; this.map[row - 1][col] = 0; }

                        // 2. Relocate the saved obstacle to a new empty spot!
                        if (removedObstacle !== 0) {
                            let isRelocated = false;
                            while (!isRelocated) {
                                // Pick a random spot anywhere on the map
                                let randRow = Math.floor(Math.random() * this.rows);
                                let randCol = Math.floor(Math.random() * this.cols);

                                // If that random spot is pure grass (0), drop the obstacle there!
                                if (this.map[randRow][randCol] === 0) {
                                    this.map[randRow][randCol] = removedObstacle;
                                    isRelocated = true;
                                }
                            }
                        }
                    }
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
                            sourceX = 160; sourceY = 64; // Boundary Mud Cliff
                        } else if (tile === 5) { 
                            sourceX = 568; sourceY = 161; // Wooden Walls
                        } else if (tile === 3) { 
                            sourceX = 568; sourceY = 144; // Barrels
                        } else if (tile === 2) { 
                            sourceX = 513; sourceY = 80; //  Tree Stump
                        } else if (tile === 10) { 
                            // DECOR: Mix of Grass 1 and Grass 2
                            if ((row + col) % 2 === 0) { sourceX = 963; sourceY = 209; } 
                            else { sourceX = 976; sourceY = 160; }
                        } 
                        else if (tile === 11) { 
                            // DECOR: Mix of Planted Veggie 1 and 2
                            if ((row + col) % 2 === 0) { sourceX = 769; sourceY = 66; } //Seed
                            else { sourceX = 900; sourceY = 241; } //radish
                            //else { sourceX = 849; sourceY = 239; } //Pumpkin
                             
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