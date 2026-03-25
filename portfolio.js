// Race Start Loading Animation with Sound
const loadingScreen = document.getElementById('loadingScreen');
const lights = [
    document.getElementById('light1'),
    document.getElementById('light2'),
    document.getElementById('light3'),
    document.getElementById('light4'),
    document.getElementById('light5')
];

// Audio context for F1 sounds
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency = 800, duration = 0.15, type = 'square') {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

function playLightsOut() {
    if (!audioCtx) return;

    // Rising pitch sweep for "lights out"
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// Start sequence on first interaction (needed for audio)
const clickPrompt = document.getElementById('clickPrompt');
const loadingText = document.getElementById('loadingText');

function startRaceSequence() {
    initAudio();

    // Hide click prompt and show loading text
    clickPrompt.classList.add('hidden');
    loadingText.classList.add('visible');

    let lightIndex = 0;
    const lightInterval = setInterval(() => {
        if (lightIndex < 5) {
            lights[lightIndex].classList.add('on');
            playBeep(800, 0.15, 'square');
            lightIndex++;
        } else {
            clearInterval(lightInterval);
            // Random delay before lights out (like real F1: 0.2s - 3s)
            const randomDelay = 600 + Math.random() * 800;
            setTimeout(() => {
                // Lights out!
                lights.forEach(light => {
                    light.classList.remove('on');
                    light.classList.add('go');
                });
                playLightsOut();
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }, randomDelay);
        }
    }, 400);
}

// Only start on user click (required for audio in browsers)
let raceStarted = false;

if (loadingScreen) {
    document.addEventListener('click', () => {
        if (!raceStarted) {
            raceStarted = true;
            startRaceSequence();
        }
    }, { once: true });
}

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 3D Tilt Effect for License Card
const license = document.getElementById('license');
if (license && !window.matchMedia('(pointer: coarse)').matches) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const xAxis = (centerX - x) / 30;
        const yAxis = (y - centerY) / 30;

        gsap.to(license, {
            rotateY: xAxis,
            rotateX: yAxis,
            duration: 0.5,
            ease: "power2.out"
        });
    });

    hero.addEventListener('mouseleave', () => {
        gsap.to(license, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}

// Rev Counter - lights up based on scroll speed
const revLights = document.querySelectorAll('.rev-light');
const drsZone = document.getElementById('drsZone');
let lastScrollY = 0;
let scrollVelocity = 0;

function updateRevCounter() {
    const currentScrollY = window.scrollY;
    scrollVelocity = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    // Light up rev lights based on scroll speed
    const activeLights = Math.min(Math.floor(scrollVelocity / 5), 10);

    revLights.forEach((light, index) => {
        light.classList.remove('green', 'yellow', 'red');
        if (index < activeLights) {
            if (index < 4) light.classList.add('green');
            else if (index < 7) light.classList.add('yellow');
            else light.classList.add('red');
        }
    });

    // DRS zone activates when scrolling fast
    if (scrollVelocity > 30) {
        drsZone.classList.add('active');
    } else {
        drsZone.classList.remove('active');
    }

    requestAnimationFrame(updateRevCounter);
}
updateRevCounter();

// Custom Cursor with GSAP for smooth movement
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (!window.matchMedia('(pointer: coarse)').matches) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation using GSAP ticker
    gsap.ticker.add(() => {
        // Main cursor - fast follow
        cursorX += (mouseX - cursorX) * 0.35;
        cursorY += (mouseY - cursorY) * 0.35;
        gsap.set(cursor, { left: cursorX, top: cursorY });

        // Follower - slower, smoother follow
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        gsap.set(cursorFollower, { left: followerX, top: followerY });
    });

    document.querySelectorAll('a, button, .project-card, .season-content, .skill-category, .trophy-card, .contact-method, .social-link').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            gsap.to(cursorFollower, { scale: 1.5, opacity: 0.5, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            gsap.to(cursorFollower, { scale: 1, opacity: 1, duration: 0.3 });
        });
    });
} else {
    // Hide cursor on touch devices
    cursor.style.display = 'none';
    cursorFollower.style.display = 'none';
}

// Hero Animation
gsap.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1,
    ease: "power4.out",
    delay: 0.2
});

gsap.from('.driver-tag', {
    x: -50,
    opacity: 0,
    duration: 0.8,
    delay: 0.5
});

gsap.from('.hero-subtitle', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.7
});

gsap.from('.cta-group', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.9
});

// Sections Reveal
gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header, {
        scrollTrigger: {
            trigger: header,
            start: "top 80%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });
});

// Timeline Animation
gsap.utils.toArray('.season').forEach((season, i) => {
    gsap.from(season, {
        scrollTrigger: {
            trigger: season,
            start: "top 85%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power3.out"
    });
});

// Projects Stagger
gsap.from('.project-card', {
    scrollTrigger: {
        trigger: '.projects-grid',
        start: "top 80%",
    },
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: "power3.out"
});

// Skills Animation
gsap.from('.skill-category', {
    scrollTrigger: {
        trigger: '.skills-grid',
        start: "top 80%",
    },
    y: 30,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out"
});

// Trophy Animation
gsap.from('.trophy-card', {
    scrollTrigger: {
        trigger: '.trophy-grid',
        start: "top 80%",
    },
    y: 30,
    duration: 0.6,
    stagger: 0.2,
    ease: "power3.out"
});

// Education Animation
gsap.from('.education-card', {
    scrollTrigger: {
        trigger: '.education-grid',
        start: "top 80%",
    },
    y: 30,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out"
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tire Mark System
class TireMarkSystem {
    constructor(options = {}) {
        this.options = {
            count: options.count || 8,
            maxLength: options.maxLength || 300,
            opacity: options.opacity || 0.15,
            color: options.color || '#0a0a0a',
            blur: options.blur || 2,
            zIndex: options.zIndex || 1,
            animate: options.animate || false,
            ...options
        };
        this.marks = [];
        this.init();
    }

    init() {
        this.createContainer();
        this.generateMarks();
        if (this.options.animate) {
            this.bindScroll();
        }
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'tire-mark-system';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.options.zIndex};
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }

    generateMarks() {
        for (let i = 0; i < this.options.count; i++) {
            this.createTireMark(i);
        }
    }

    createTireMark(i) {
        const mark = document.createElement('div');
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const top = Math.random() * 100;
        const rotation = side === 'left'
            ? -30 + Math.random() * 60
            : 150 + Math.random() * 60;

        const length = 200 + Math.random() * this.options.maxLength;
        const curve = 50 + Math.random() * 100;
        const width = 20 + Math.random() * 40;
        const filterId = 'rubberTexture' + Math.floor(Math.random() * 1000);
        const gradientId = 'skidFade' + i;

        const svg = `
            <svg width="${length + 100}" height="${width * 3}" viewBox="0 0 ${length + 100} ${width * 3}" style="overflow: visible;">
                <defs>
                    <filter id="${filterId}">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>
                        <feGaussianBlur stdDeviation="${this.options.blur}"/>
                    </filter>
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:${this.options.color};stop-opacity:0" />
                        <stop offset="20%" style="stop-color:${this.options.color};stop-opacity:${this.options.opacity}" />
                        <stop offset="80%" style="stop-color:${this.options.color};stop-opacity:${this.options.opacity * 0.7}" />
                        <stop offset="100%" style="stop-color:${this.options.color};stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="M 0 ${width * 1.5} Q ${length / 2} ${width * 1.5 - curve} ${length} ${width * 1.5 + (Math.random() * 40 - 20)}"
                      stroke="url(#${gradientId})"
                      stroke-width="${width}"
                      fill="none"
                      filter="url(#${filterId})"
                      stroke-linecap="round"/>
                <path d="M 10 ${width * 1.5} Q ${length / 2} ${width * 1.5 - curve} ${length - 10} ${width * 1.5 + (Math.random() * 40 - 20)}"
                      stroke="${this.options.color}"
                      stroke-width="${width * 0.3}"
                      fill="none"
                      opacity="${this.options.opacity * 1.5}"
                      stroke-linecap="round"/>
                ${this.generateMarbles(5, length, width * 3)}
            </svg>
        `;

        mark.innerHTML = svg;
        mark.style.cssText = `
            position: absolute;
            top: ${top}%;
            ${side}: -50px;
            transform: rotate(${rotation}deg);
            transform-origin: center;
            pointer-events: none;
            mix-blend-mode: multiply;
        `;

        mark.dataset.rotation = rotation;
        mark.dataset.speed = 0.5 + Math.random() * 1;

        this.container.appendChild(mark);
        this.marks.push(mark);
    }

    generateMarbles(count, areaWidth, areaHeight) {
        let marbles = '';
        for (let i = 0; i < count; i++) {
            const x = Math.random() * areaWidth;
            const y = Math.random() * areaHeight;
            const r = 2 + Math.random() * 4;
            marbles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${this.options.color}" opacity="${this.options.opacity * 2}"/>`;
        }
        return marbles;
    }

    bindScroll() {
        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const delta = scrollY - lastScroll;

                    this.marks.forEach((mark) => {
                        const speed = parseFloat(mark.dataset.speed);
                        const rotation = parseFloat(mark.dataset.rotation);
                        const moveX = (scrollY * speed * 0.1) % 100;
                        const skew = Math.min(Math.max(delta * 0.1, -10), 10);

                        mark.style.transform = `
                            rotate(${rotation}deg)
                            translateX(${moveX}px)
                            skewX(${skew}deg)
                        `;
                    });

                    lastScroll = scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

// Initialize tire marks
new TireMarkSystem({
    count: 6,
    opacity: 0.1,
    blur: 2,
    zIndex: 0
});

new TireMarkSystem({
    count: 4,
    opacity: 0.08,
    animate: true,
    color: '#141414'
});

// Pit Lane Card Stack
(function () {
    const stage = document.getElementById('cardStackStage');
    if (!stage) return;

    const items = Array.from(stage.querySelectorAll('.card-stack-item'));
    const dotsContainer = document.getElementById('cardStackDots');
    if (!items.length || !dotsContainer) return;

    const len = items.length;
    let active = 0;
    let autoInterval = null;

    const MAX_OFFSET = 3;
    const SPREAD_DEG = 48;
    const STEP_DEG = SPREAD_DEG / MAX_OFFSET;
    const DEPTH_PX = 140;
    const TILT_X = 12;
    const ACTIVE_LIFT = 40;   // more lift so active card sits higher
    const ACTIVE_SCALE = 1.05;
    const INACTIVE_SCALE = 0.92;

    function cardSpacing() {
        return Math.round(items[0].offsetWidth * 0.50);
    }

    function wrapIdx(n) { return ((n % len) + len) % len; }

    function signedOff(i, act) {
        const raw = i - act;
        const alt = raw > 0 ? raw - len : raw + len;
        return Math.abs(alt) < Math.abs(raw) ? alt : raw;
    }

    // Build dots
    const dots = [];
    items.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'card-stack-dot' + (idx === 0 ? ' active' : '');
        btn.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
        btn.addEventListener('click', () => goTo(idx));
        dotsContainer.appendChild(btn);
        dots.push(btn);
    });

    function applyTransforms() {
        const spacing = cardSpacing();
        items.forEach((el, i) => {
            const off = signedOff(i, active);
            const abs = Math.abs(off);

            if (abs > MAX_OFFSET) {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                el.style.zIndex = '0';
                return;
            }

            const isAct = off === 0;
            const x = off * spacing;
            const y = abs * 8;
            const z = -abs * DEPTH_PX;
            const rotZ = off * STEP_DEG;
            const rotX = isAct ? 0 : TILT_X;
            const scale = isAct ? ACTIVE_SCALE : INACTIVE_SCALE;
            const lift = isAct ? -ACTIVE_LIFT : 0;

            el.style.zIndex = String(100 - abs);
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            el.style.transform = `translateX(${x}px) translateY(${y + lift}px) translateZ(${z}px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) scale(${scale})`;
            el.classList.toggle('is-active', isAct);
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }

    function goTo(idx) { active = wrapIdx(idx); applyTransforms(); }
    function next() { goTo(active + 1); }
    function prev() { goTo(active - 1); }

    // Click inactive cards to focus them
    items.forEach((el, i) => {
        el.addEventListener('click', (e) => {
            if (i !== active) { e.stopPropagation(); goTo(i); }
        });
    });

    // Mouse drag-to-swipe
    let dragStartX = null, didDrag = false;
    stage.addEventListener('mousedown', (e) => {
        if (!items[active].contains(e.target)) return;
        dragStartX = e.clientX; didDrag = false;
    });
    window.addEventListener('mousemove', (e) => {
        if (dragStartX === null) return;
        if (Math.abs(e.clientX - dragStartX) > 6) didDrag = true;
    });
    window.addEventListener('mouseup', (e) => {
        if (dragStartX === null) return;
        const dx = e.clientX - dragStartX;
        dragStartX = null;
        if (!didDrag) return;
        didDrag = false;
        if (Math.abs(dx) > 80) { dx > 0 ? prev() : next(); stopAuto(); }
    });

    // Touch swipe
    let touchX = null;
    stage.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 55) { dx > 0 ? prev() : next(); }
    }, { passive: true });

    // Keyboard
    stage.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); stopAuto(); }
        if (e.key === 'ArrowRight') { next(); stopAuto(); }
    });

    // Auto-advance
    function startAuto() { clearInterval(autoInterval); autoInterval = setInterval(next, 2800); }
    function stopAuto() { clearInterval(autoInterval); autoInterval = null; }

    const wrapper = stage.closest('.card-stack-wrapper');
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);

    // Set initial positions (invisible until entrance fires)
    applyTransforms();
    gsap.set(wrapper, { opacity: 0, y: 70 });

    // Scroll entrance: slide up + fade in, then start auto-advance
    ScrollTrigger.create({
        trigger: wrapper,
        start: 'top 78%',
        once: true,
        onEnter: function () {
            gsap.to(wrapper, {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: 'power3.out',
                onComplete: startAuto
            });
        }
    });

    window.addEventListener('resize', applyTransforms);
})();

// Glass Cards stacking effect (Experience / Race History)
(function () {
    const wrappers = document.querySelectorAll('.glass-card-wrapper');
    if (!wrappers.length) return;

    const total = wrappers.length;

    // Inject scroll hint into every wrapper except the last
    wrappers.forEach((wrapper, index) => {
        if (index === total - 1) return;
        const hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.innerHTML =
            '<span class="scroll-hint-text">scroll</span>' +
            '<div class="scroll-hint-chevron"></div>' +
            '<div class="scroll-hint-chevron"></div>';
        wrapper.appendChild(hint);
    });

    wrappers.forEach((wrapper, index) => {
        const card = wrapper.querySelector('.glass-card');
        if (!card) return;

        const targetScale = 1 - (total - index) * 0.05;

        // Entrance: first card slides up + fades in; subsequent cards already
        // visible from below so just fade in as they come into the sticky zone
        gsap.set(card, { opacity: 0, y: 60, scale: 1, transformOrigin: 'center top' });

        ScrollTrigger.create({
            trigger: wrapper,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    delay: index * 0.06,
                    ease: 'power3.out'
                });
            }
        });

        // Scale-down scrub as card is scrolled past
        ScrollTrigger.create({
            trigger: wrapper,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            onUpdate: function (self) {
                var scale = gsap.utils.interpolate(1, targetScale, self.progress);
                gsap.set(card, {
                    scale: Math.max(scale, targetScale),
                    transformOrigin: 'center top'
                });
            }
        });
    });
})();

// Active nav link for current page
(function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
})();

// =============================================
// PILL NAVIGATION
// =============================================
(function () {
    const pillNav = document.getElementById('pillNav');
    if (!pillNav) return;

    // Add shadow layer div
    const shadow = document.createElement('div');
    shadow.className = 'pill-nav-shadow';
    pillNav.appendChild(shadow);

    // --- Active state detection ---
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const pageLabels = {
        'index.html': 'Home',
        '': 'Home',
        'experience.html': 'Seasons',
        'projects.html': 'Garage',
        'skills.html': 'Setup',
        'trophies.html': 'Trophies',
        'pitlane.html': 'Pit Lane',
        'education.html': 'Training',
        'contact.html': 'Radio',
    };

    const pillActiveLabel = document.getElementById('pillActiveLabel');
    if (pillActiveLabel) {
        pillActiveLabel.textContent = pageLabels[page] || 'Home';
    }

    document.querySelectorAll('.pill-item').forEach(link => {
        const href = link.getAttribute('href') || '';
        const hrefPage = href.split('#')[0].split('/').pop() || 'index.html';
        if (hrefPage === page || (page === '' && hrefPage === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Expand / Collapse ---
    let collapseTimeout = null;

    pillNav.addEventListener('mouseenter', () => {
        if (collapseTimeout) { clearTimeout(collapseTimeout); collapseTimeout = null; }
        pillNav.classList.add('expanded');
    });

    pillNav.addEventListener('mouseleave', () => {
        collapseTimeout = setTimeout(() => {
            pillNav.classList.remove('expanded');
        }, 500);
    });

    // On click: update label optimistically then collapse
    document.querySelectorAll('.pill-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.pill-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            if (pillActiveLabel) pillActiveLabel.textContent = item.textContent.trim();
            if (collapseTimeout) clearTimeout(collapseTimeout);
            collapseTimeout = setTimeout(() => pillNav.classList.remove('expanded'), 200);
        });
    });
})();
