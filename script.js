// Global Variables
let isAutoPlaying = false;
let autoPlayInterval;
const scrollSpeed = 3; // pixels per frame
let lastScrollPos = 0;
let currentSpeed = 0;

// Checkpoint names
const checkpoints = {
    'start': 'START',
    'projects': 'PROJECTS ZONE',
    'career': 'CAREER HQ',
    'education': 'ACHIEVEMENTS',
    'skills': 'POWER-UPS',
    'contact': 'FINISH LINE'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    updateGameHUD();
});

// Initialize Game
function initializeGame() {
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = '📅 ' + today.toLocaleDateString('en-US', options);

    // Animate elements on scroll
    observeElements();
}

// Setup Event Listeners
function setupEventListeners() {
    // Auto Play Button
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    autoPlayBtn.addEventListener('click', toggleAutoPlay);

    // Pause Button
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.addEventListener('click', pauseGame);

    // Reset Button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', resetGame);

    // Scroll listener for game updates
    window.addEventListener('scroll', () => {
        updateGameHUD();
        calculateSpeed();
        updateCarAnimation();
    }, { passive: true });
}

// Auto Play Toggle
function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const car = document.getElementById('gameCar');

    if (isAutoPlaying) {
        autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        car.classList.add('moving');
        startAutoPlay();
    } else {
        autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        car.classList.remove('moving');
        stopAutoPlay();
    }
}

// Start Auto Play
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (window.pageYOffset >= maxScroll) {
            stopAutoPlay();
            const autoPlayBtn = document.getElementById('autoPlayBtn');
            const car = document.getElementById('gameCar');
            autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            car.classList.remove('moving');
            isAutoPlaying = false;
            return;
        }

        window.scrollBy(0, scrollSpeed);
    }, 16); // ~60fps
}

// Stop Auto Play
function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Pause Game
function pauseGame() {
    stopAutoPlay();
    isAutoPlaying = false;
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const car = document.getElementById('gameCar');
    autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    car.classList.remove('moving');
}

// Reset Game
function resetGame() {
    stopAutoPlay();
    isAutoPlaying = false;
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const car = document.getElementById('gameCar');
    autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    car.classList.remove('moving');

    // Smooth scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Calculate Speed based on scroll velocity
function calculateSpeed() {
    const currentScrollPos = window.pageYOffset;
    const scrollDelta = Math.abs(currentScrollPos - lastScrollPos);

    // Calculate speed (pixels per frame converted to km/h for game feel)
    currentSpeed = Math.min(Math.round(scrollDelta * 5), 200);

    lastScrollPos = currentScrollPos;

    // Update speed display
    document.getElementById('speedValue').textContent = currentSpeed + ' KM/H';

    // Update speed meter fill
    const speedFill = document.getElementById('speedFill');
    const speedPercent = (currentSpeed / 200) * 100;
    speedFill.style.width = speedPercent + '%';

    // Decay speed if not scrolling
    setTimeout(() => {
        if (currentSpeed > 0) {
            currentSpeed = Math.max(0, currentSpeed - 5);
        }
    }, 100);
}

// Update Game HUD
function updateGameHUD() {
    // Calculate progress
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progressValue').textContent = Math.round(scrollPercent) + '%';

    // Calculate distance (based on scroll percentage)
    const totalDistance = 100; // Total journey is 100 km
    const currentDistance = Math.round((scrollPercent / 100) * totalDistance);
    document.getElementById('distanceValue').textContent = currentDistance + ' KM';

    // Update current checkpoint
    updateCheckpoint();
}

// Update Current Checkpoint
function updateCheckpoint() {
    const sections = document.querySelectorAll('.journey-stop');
    let currentCheckpoint = 'START';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 300) {
            const sectionId = section.id;
            currentCheckpoint = checkpoints[sectionId] || 'UNKNOWN';
        }
    });

    document.getElementById('checkpointValue').textContent = currentCheckpoint;
}

// Update Car Animation based on speed
function updateCarAnimation() {
    const car = document.getElementById('gameCar');

    if (currentSpeed > 10) {
        car.classList.add('moving');
    } else {
        car.classList.remove('moving');
    }
}

// Observe Elements for Animations
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Animate children with delay
                const children = entry.target.querySelectorAll('.project-card, .career-building, .achievement-card, .skill-machine');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe all journey stops
    const journeyStops = document.querySelectorAll('.journey-stop');
    journeyStops.forEach(stop => {
        observer.observe(stop);
    });

    // Set initial state for animated elements
    const animatedElements = document.querySelectorAll('.project-card, .career-building, .achievement-card, .skill-machine');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
    });
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Space bar to toggle auto play
    if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        toggleAutoPlay();
    }

    // Escape to pause
    if (e.code === 'Escape') {
        pauseGame();
    }

    // Home key to reset
    if (e.code === 'Home') {
        e.preventDefault();
        resetGame();
    }

    // Arrow keys for manual scrolling
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        window.scrollBy({ top: 150, behavior: 'smooth' });
    }

    if (e.code === 'ArrowUp') {
        e.preventDefault();
        window.scrollBy({ top: -150, behavior: 'smooth' });
    }
});

// Add 3D tilt effect to project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// Scroll hint
function createScrollHint() {
    if (window.pageYOffset === 0) {
        const hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.innerHTML = `
            <div style="
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid var(--game-primary);
                padding: 15px 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
                z-index: 999;
                animation: bounce 2s infinite;
                font-weight: bold;
                color: var(--game-secondary);
                font-size: 12px;
                font-family: 'Press Start 2P', monospace;
            ">
                ↓ PRESS SPACE OR SCROLL ↓
            </div>
        `;

        document.body.appendChild(hint);

        // Remove hint after first scroll
        const removeHint = () => {
            if (window.pageYOffset > 50) {
                hint.style.opacity = '0';
                hint.style.transition = 'opacity 0.3s ease';
                setTimeout(() => hint.remove(), 300);
                window.removeEventListener('scroll', removeHint);
            }
        };

        window.addEventListener('scroll', removeHint);

        // Also remove on spacebar press
        const removeOnSpace = (e) => {
            if (e.code === 'Space') {
                hint.style.opacity = '0';
                hint.style.transition = 'opacity 0.3s ease';
                setTimeout(() => hint.remove(), 300);
                document.removeEventListener('keydown', removeOnSpace);
            }
        };
        document.addEventListener('keydown', removeOnSpace);
    }
}

// Show scroll hint after 2 seconds
setTimeout(createScrollHint, 2000);

// Performance optimization - Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll handlers
const throttledUpdateHUD = throttle(updateGameHUD, 50);
const throttledCalculateSpeed = throttle(calculateSpeed, 50);

window.addEventListener('scroll', () => {
    throttledUpdateHUD();
    throttledCalculateSpeed();
}, { passive: true });

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.remove('loading');

    // Fade in body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Console welcome message
console.log(`
%c🎮 ABDUL MALIK'S CAREER JOURNEY 🎮
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%cCONTROLS:
• SPACE    - Start/Stop
• ESC      - Pause
• HOME     - Reset
• ↑/↓      - Manual Drive

%cGOOD LUCK!
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
'font-size: 16px; font-weight: bold; color: #ff6b35; font-family: monospace;',
'color: #f7931e; font-family: monospace;',
'font-size: 12px; color: #00ff00; font-family: monospace;',
'font-size: 14px; color: #ff6b35; font-weight: bold; font-family: monospace;',
'color: #f7931e; font-family: monospace;'
);

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    // Turbo mode!
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px 50px;
            border-radius: 15px;
            border: 5px solid #000;
            box-shadow: 0 0 40px rgba(255, 107, 53, 0.8);
            z-index: 10000;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            font-family: 'Press Start 2P', monospace;
        ">
            🚀 TURBO MODE! 🚀
        </div>
    `;

    document.body.appendChild(message);

    // Activate turbo mode
    const originalSpeed = scrollSpeed;
    const car = document.getElementById('gameCar');
    car.style.filter = 'drop-shadow(0 15px 20px rgba(255, 107, 53, 0.8)) hue-rotate(180deg)';

    setTimeout(() => {
        message.style.transition = 'opacity 0.5s ease';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
        car.style.filter = 'drop-shadow(0 15px 20px rgba(0, 0, 0, 0.5))';
    }, 3000);
}

// Mobile touch gestures
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped up - scroll down
            window.scrollBy({ top: 200, behavior: 'smooth' });
        } else {
            // Swiped down - scroll up
            window.scrollBy({ top: -200, behavior: 'smooth' });
        }
    }
}

// Add visibility change handler to pause auto-play when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isAutoPlaying) {
        pauseGame();
    }
});

// Add sound effects (commented out - enable if you add sound files)
/*
const sounds = {
    engine: new Audio('path/to/engine.mp3'),
    checkpoint: new Audio('path/to/checkpoint.mp3'),
    victory: new Audio('path/to/victory.mp3')
};

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
    }
}
*/
