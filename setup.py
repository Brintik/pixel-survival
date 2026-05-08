import os

# Define the scalable folder structure
directories = [
    "css",
    "assets/images",
    "assets/audio",
    "assets/data",
    "js/engine",
    "js/entities",
    "js/scenes",
    "js/utils"
]

# Define the files and their starter content
files = {
    "index.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Adventure</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <canvas id="gameCanvas" width="320" height="240"></canvas>
    
    <script type="module" src="js/main.js"></script>
</body>
</html>""",

    "css/style.css": """body {
    margin: 0;
    padding: 0;
    background-color: #222;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

canvas {
    background-color: #5c94fc; /* Sky blue background */
    width: 640px; 
    height: 480px;
    image-rendering: pixelated; 
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}""",

    "js/engine/input.js": """export const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});""",

    "js/entities/player.js": """import { keys } from '../engine/input.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.speed = 2;
        this.color = '#ff0000'; // Red square placeholder
    }

    update() {
        if (keys.ArrowUp) this.y -= this.speed;
        if (keys.ArrowDown) this.y += this.speed;
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}""",

    "js/main.js": """import { Player } from './entities/player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize Game Objects
const player = new Player(150, 110);

// The Game Loop
function gameLoop() {
    // 1. Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update logic
    player.update();

    // 3. Draw everything
    player.draw(ctx);

    // 4. Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();""",
    
    # Empty placeholder files for future scaling
    "js/engine/renderer.js": "// Rendering logic goes here\n",
    "js/engine/physics.js": "// Physics and collision logic goes here\n",
    "js/entities/entity.js": "// Base entity class goes here\n",
    "js/scenes/menu.js": "// Main menu scene logic goes here\n",
    "js/scenes/level.js": "// Level logic goes here\n",
    "js/utils/constants.js": "// Global variables (e.g., const SCREEN_WIDTH = 320;) goes here\n"
}

def create_scaffolding():
    print("🚀 Bootstrapping Pixel Game Project...\n")
    
    # Create directories
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 Created directory: {directory}")
        
    print("\n📝 Generating files...")
    
    # Create files and write content
    for filepath, content in files.items():
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"📄 Created file: {filepath}")

    print("\n✅ Setup complete! You can now open index.html in your browser.")

if __name__ == "__main__":
    create_scaffolding()