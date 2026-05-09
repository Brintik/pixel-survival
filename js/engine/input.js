// js/engine/input.js
export const keys = {};
export const mouse = { x: 0, y: 0, isDown: false };

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

window.addEventListener('mousedown', () => mouse.isDown = true);
window.addEventListener('mouseup', () => mouse.isDown = false);

window.addEventListener('mousemove', (e) => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // 1. Find the exact scale multiplier the CSS 'object-fit: cover' is using to stretch the canvas
    const scale = Math.max(rect.width / canvas.width, rect.height / canvas.height);

    // 2. Calculate the invisible "cropped" area that is hiding outside your monitor's borders
    const offsetX = (rect.width - canvas.width * scale) / 2;
    const offsetY = (rect.height - canvas.height * scale) / 2;

    // 3. Convert raw screen pixels into perfect internal game world pixels!
    mouse.x = (e.clientX - rect.left - offsetX) / scale;
    mouse.y = (e.clientY - rect.top - offsetY) / scale;
});