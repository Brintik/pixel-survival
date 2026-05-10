// js/engine/input.js

export const keys = {};
export const mouse = { x: 0, y: 0, isDown: false };
export const joyMove = { x: 0, y: 0, active: false };

// --- 1. HARDWARE KEYBOARD ---
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// --- 2. UNIVERSAL COORDINATE CONVERTER ---
// Converts both mouse clicks AND touch taps into perfect game-world pixels!
function updateMouseCoords(clientX, clientY) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(rect.width / canvas.width, rect.height / canvas.height);
    const offsetX = (rect.width - canvas.width * scale) / 2;
    const offsetY = (rect.height - canvas.height * scale) / 2;
    
    mouse.x = (clientX - rect.left - offsetX) / scale;
    mouse.y = (clientY - rect.top - offsetY) / scale;
}

// --- 3. HARDWARE MOUSE ---
window.addEventListener('mousedown', (e) => { mouse.isDown = true; updateMouseCoords(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => mouse.isDown = false);
window.addEventListener('mousemove', (e) => updateMouseCoords(e.clientX, e.clientY));

// --- 4. TOUCH SCREEN TAPS & HOLDS (Multi-Touch Aware!) ---
let attackTouchId = null;

window.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // If the tap is NOT on the joystick or a menu button, it's an attack command!
        if (target && !target.closest('.joystick-base') && !target.closest('button')) {
            attackTouchId = touch.identifier;
            mouse.isDown = true; // Simulates a mouse press!
            updateMouseCoords(touch.clientX, touch.clientY);
        }
    }
});

window.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // Only update aiming if they are dragging the specific attack finger
        if (touch.identifier === attackTouchId) {
            updateMouseCoords(touch.clientX, touch.clientY);
        }
    }
});

window.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        // Release the trigger when the attack finger lifts
        if (e.changedTouches[i].identifier === attackTouchId) {
            attackTouchId = null;
            mouse.isDown = false; 
        }
    }
});

// --- 5. VIRTUAL MOVEMENT JOYSTICK ---
export function initMobileControls() {
    if (!('ontouchstart' in window)) return;
    document.getElementById('mobile-controls').classList.remove('hidden');

    const base = document.getElementById('joystick-move');
    const knob = base.querySelector('.joystick-knob');
    const maxRadius = base.clientWidth / 2;
    let stickTouchId = null;

    function updateKnob(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === stickTouchId) {
                const touch = e.changedTouches[i];
                const rect = base.getBoundingClientRect();
                
                let dx = touch.clientX - (rect.left + maxRadius);
                let dy = touch.clientY - (rect.top + maxRadius);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > maxRadius) {
                    dx = (dx / distance) * maxRadius;
                    dy = (dy / distance) * maxRadius;
                }

                knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                joyMove.x = dx / maxRadius;
                joyMove.y = dy / maxRadius;
                joyMove.active = true;
            }
        }
    }

    base.addEventListener('touchstart', (e) => {
        if (stickTouchId === null) {
            stickTouchId = e.changedTouches[0].identifier;
            updateKnob(e);
        }
    });
    base.addEventListener('touchmove', updateKnob);

    function releaseJoystick(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === stickTouchId) {
                stickTouchId = null;
                joyMove.x = 0; joyMove.y = 0; joyMove.active = false;
                knob.style.transform = `translate(-50%, -50%)`;
            }
        }
    }
    base.addEventListener('touchend', releaseJoystick);
    base.addEventListener('touchcancel', releaseJoystick);
}