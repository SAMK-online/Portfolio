// Global Variables
let isAutoPlaying = false;
let autoPlayInterval;
const scrollSpeed = 2; // pixels per frame

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeJourney();
    setupEventListeners();
    updateCarPosition();
    updateProgress();
});

// Initialize Journey
function initializeJourney() {
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = today.toLocaleDateString('en-US', options);

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
    pauseBtn.addEventListener('click', pauseJourney);

    // Reset Button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', resetJourney);

    // Scroll listener for car position and progress
    window.addEventListener('scroll', () => {
        updateCarPosition();
        updateProgress();
        updateActiveMilestone();
    });

    // Milestone navigation
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        milestone.addEventListener('click', (e) => {
            const location = e.target.dataset.location;
            navigateToLocation(location);
        });
    });
}

// Auto Play Toggle
function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    const autoPlayBtn = document.getElementById('autoPlayBtn');

    if (isAutoPlaying) {
        autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        startAutoPlay();
    } else {
        autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
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
            autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
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

// Pause Journey
function pauseJourney() {
    stopAutoPlay();
    isAutoPlaying = false;
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// Reset Journey
function resetJourney() {
    stopAutoPlay();
    isAutoPlaying = false;
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    autoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';

    // Smooth scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Update Car Position
function updateCarPosition() {
    const car = document.getElementById('travelCar');
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    // Keep car in viewport but move slightly based on scroll
    // Car stays mostly fixed but wobbles slightly
    const baseTop = 100;
    const wobble = Math.sin(scrollPercent / 10) * 10;
    car.style.top = `${baseTop + wobble}px`;
}

// Update Progress Bar
function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const scrollPercent = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    progressBar.style.setProperty('--progress', `${scrollPercent}%`);
    progressBar.style.background = `linear-gradient(to bottom,
        #4CAF50 0%,
        #8BC34A ${scrollPercent}%,
        rgba(0,0,0,0.1) ${scrollPercent}%,
        rgba(0,0,0,0.1) 100%)`;
}

// Update Active Milestone
function updateActiveMilestone() {
    const sections = document.querySelectorAll('.journey-stop');
    const milestones = document.querySelectorAll('.milestone');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 300) {
            currentSection = section.id;
        }
    });

    milestones.forEach(milestone => {
        milestone.classList.remove('active');
        if (milestone.dataset.location === currentSection) {
            milestone.classList.add('active');
        }
    });
}

// Navigate to Location
function navigateToLocation(location) {
    const targetSection = document.getElementById(location);

    if (targetSection) {
        // Stop auto play if active
        if (isAutoPlaying) {
            pauseJourney();
        }

        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
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
                const children = entry.target.querySelectorAll('.project-booth, .career-building, .achievement-house, .skill-pump');
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
    const animatedElements = document.querySelectorAll('.project-booth, .career-building, .achievement-house, .skill-pump');
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
        pauseJourney();
    }

    // Home key to reset
    if (e.code === 'Home') {
        e.preventDefault();
        resetJourney();
    }

    // Arrow keys for manual scrolling
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        window.scrollBy({ top: 100, behavior: 'smooth' });
    }

    if (e.code === 'ArrowUp') {
        e.preventDefault();
        window.scrollBy({ top: -100, behavior: 'smooth' });
    }
});

// Add parallax effect to road
window.addEventListener('scroll', () => {
    const road = document.querySelector('.road');
    const roadLines = document.querySelector('.road-lines');
    const scrolled = window.pageYOffset;

    // Parallax effect - slight movement
    if (road) {
        const parallaxSpeed = scrolled * 0.05;
        road.style.transform = `translateX(-50%) translateY(${parallaxSpeed}px)`;
    }
});

// Animate milestone on hover
const milestones = document.querySelectorAll('.milestone');
milestones.forEach((milestone, index) => {
    milestone.addEventListener('mouseenter', () => {
        milestone.style.transform = 'translateX(5px) scale(1.1)';
    });

    milestone.addEventListener('mouseleave', () => {
        milestone.style.transform = 'translateX(0) scale(1)';
    });
});

// Add floating animation to badges
function animateBadges() {
    const badges = document.querySelectorAll('.badge-item');
    badges.forEach((badge, index) => {
        const delay = index * 0.5;
        badge.style.animationDelay = `${delay}s`;

        // Random float animation
        setInterval(() => {
            const randomY = (Math.random() - 0.5) * 10;
            const currentTransform = badge.style.transform || 'translateY(0px)';
            badge.style.transform = `translateY(${randomY}px)`;
        }, 3000 + (index * 500));
    });
}

// Initialize badge animations after page load
setTimeout(animateBadges, 1000);

// Add tilt effect to project booths
const projectBooths = document.querySelectorAll('.project-booth');
projectBooths.forEach(booth => {
    booth.addEventListener('mousemove', (e) => {
        const rect = booth.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        booth.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px)`;
    });

    booth.addEventListener('mouseleave', () => {
        booth.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// Add pulse animation to contact channels
const contactChannels = document.querySelectorAll('.contact-channel');
contactChannels.forEach((channel, index) => {
    channel.addEventListener('mouseenter', () => {
        channel.style.transform = 'translateX(15px) scale(1.02)';
    });

    channel.addEventListener('mouseleave', () => {
        channel.style.transform = 'translateX(0) scale(1)';
    });
});

// Smooth scroll indicator at the start
function createScrollHint() {
    if (window.pageYOffset === 0) {
        const hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.innerHTML = `
            <div style="
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 15px 30px;
                border-radius: 50px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 999;
                animation: bounce 2s infinite;
                font-weight: 600;
                color: var(--accent-color);
            ">
                <i class="fas fa-arrow-down"></i> Scroll to begin your journey
            </div>
        `;

        document.body.appendChild(hint);

        // Remove hint after first scroll
        const removeHint = () => {
            if (window.pageYOffset > 50) {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 300);
                window.removeEventListener('scroll', removeHint);
            }
        };

        window.addEventListener('scroll', removeHint);
    }
}

// Show scroll hint after 2 seconds
setTimeout(createScrollHint, 2000);

// Add sound effects (optional - commented out by default)
/*
const sounds = {
    start: new Audio('path/to/start-sound.mp3'),
    milestone: new Audio('path/to/milestone-sound.mp3'),
    complete: new Audio('path/to/complete-sound.mp3')
};

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
    }
}
*/

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
const throttledUpdateCar = throttle(updateCarPosition, 50);
const throttledUpdateProgress = throttle(updateProgress, 50);
const throttledUpdateMilestone = throttle(updateActiveMilestone, 100);

window.addEventListener('scroll', () => {
    throttledUpdateCar();
    throttledUpdateProgress();
    throttledUpdateMilestone();
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
%c🚗 Welcome to Abdul Malik's Career Journey! 🚗
%cKeyboard Controls:
- SPACE: Toggle auto-play
- ESC: Pause journey
- HOME: Reset to start
- Arrow Up/Down: Manual scroll

%cBuilt with passion for AI and innovation
%c📧 shaikabdulmalik958@gmail.com
%c🔗 linkedin.com/in/abdul-malik-khudus-shaik-b46b161ab/
`,
'font-size: 20px; font-weight: bold; color: #8B7355;',
'font-size: 14px; color: #667eea;',
'font-size: 12px; color: #4CAF50; font-style: italic;',
'font-size: 12px; color: #f5576c;',
'font-size: 12px; color: #11998e;'
);

// Add easter egg - Konami code
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
    // Add rainbow colors to the car
    const car = document.getElementById('travelCar');
    let hue = 0;

    const rainbowInterval = setInterval(() => {
        car.style.filter = `hue-rotate(${hue}deg) drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))`;
        hue = (hue + 5) % 360;
    }, 50);

    // Show message
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
        ">
            🎉 RAINBOW CAR ACTIVATED! 🎉
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.transition = 'opacity 0.5s ease';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
        clearInterval(rainbowInterval);
        car.style.filter = 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))';
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
        pauseJourney();
    }
});
