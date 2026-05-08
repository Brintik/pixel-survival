// js/engine/audio.js
export const sounds = {};

// Initialize and preload our audio files
export function initAudio() {
    sounds.shoot = new Audio('assets/audio/shoot.wav');
    sounds.coin = new Audio('assets/audio/coin.wav');
    sounds.crunch = new Audio('assets/audio/crunch.wav');
    sounds.powerup = new Audio('assets/audio/powerup.wav');
    sounds.explosion = new Audio('assets/audio/explosion.wav');
    sounds.hit = new Audio('assets/audio/hit.wav');
}

// Play a sound, allowing it to overlap if called rapidly
export function playSound(name, volume = 0.5) {
    if (sounds[name]) {
        const soundClone = sounds[name].cloneNode();
        soundClone.volume = volume;
        // Browsers block audio until the user clicks the screen at least once.
        // The catch() prevents the game from crashing if they haven't clicked yet!
        soundClone.play().catch(err => console.log("Waiting for user interaction to play audio."));
    }
}