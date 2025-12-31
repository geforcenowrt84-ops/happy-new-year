// ===== Configuration =====
const CONFIG = {
    targetDate: new Date('January 1, 2026 00:00:00').getTime(),
    particleCount: 80,
    snowflakeCount: 50,
    heartEmojis: ['💖', '💕', '💗', '💝', '💘', '❤️', '💜', '🩷'],
    fireworkColors: ['#e91e63', '#ff6090', '#ffd700', '#9c27b0', '#00bcd4', '#ff9800']
};

// ===== DOM Elements =====
const elements = {
    introOverlay: document.getElementById('introOverlay'),
    countdown: document.getElementById('countdown'),
    countdownWrapper: document.getElementById('countdownWrapper'),
    celebration: document.getElementById('celebration'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    musicBtn: document.getElementById('musicBtn'),
    musicIcon: document.getElementById('musicIcon'),
    bgMusic: document.getElementById('bgMusic'),
    particlesCanvas: document.getElementById('particles'),
    fireworksCanvas: document.getElementById('fireworks'),
    snowContainer: document.getElementById('snow'),
    floatingElements: document.getElementById('floatingElements')
};

// ===== Intro Overlay =====
elements.introOverlay.addEventListener('click', () => {
    elements.introOverlay.classList.add('hidden');
});

// ===== Countdown Timer =====
function updateCountdown() {
    const now = Date.now();
    const distance = CONFIG.targetDate - now;
    
    if (distance < 0) {
        elements.countdownWrapper.style.display = 'none';
        elements.celebration.style.display = 'block';
        triggerCelebration();
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Particle System (Background Stars) =====
const particlesCtx = elements.particlesCanvas.getContext('2d');
let particles = [];

function initParticleCanvas() {
    elements.particlesCanvas.width = window.innerWidth;
    elements.particlesCanvas.height = window.innerHeight;
}

class StarParticle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * elements.particlesCanvas.width;
        this.y = Math.random() * elements.particlesCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleDirection = 1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Twinkle effect
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        if (this.opacity >= 1 || this.opacity <= 0.2) {
            this.twinkleDirection *= -1;
        }
        
        // Wrap around screen
        if (this.x < 0) this.x = elements.particlesCanvas.width;
        if (this.x > elements.particlesCanvas.width) this.x = 0;
        if (this.y < 0) this.y = elements.particlesCanvas.height;
        if (this.y > elements.particlesCanvas.height) this.y = 0;
    }
    
    draw() {
        particlesCtx.beginPath();
        particlesCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        particlesCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        particlesCtx.fill();
        
        // Add glow
        particlesCtx.beginPath();
        particlesCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        particlesCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.2})`;
        particlesCtx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new StarParticle());
    }
}

function animateParticles() {
    particlesCtx.clearRect(0, 0, elements.particlesCanvas.width, elements.particlesCanvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateParticles);
}

// ===== Fireworks System =====
const fireworksCtx = elements.fireworksCanvas.getContext('2d');
let fireworks = [];
let fireworkParticles = [];

function initFireworksCanvas() {
    elements.fireworksCanvas.width = window.innerWidth;
    elements.fireworksCanvas.height = window.innerHeight;
}

class Firework {
    constructor(x, targetY) {
        this.x = x;
        this.y = window.innerHeight;
        this.targetY = targetY;
        this.speed = 4 + Math.random() * 2;
        this.color = CONFIG.fireworkColors[Math.floor(Math.random() * CONFIG.fireworkColors.length)];
        this.trail = [];
        this.exploded = false;
    }
    
    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();
        
        this.y -= this.speed;
        
        if (this.y <= this.targetY) {
            this.exploded = true;
            this.explode();
        }
    }
    
    explode() {
        const particleCount = 60 + Math.floor(Math.random() * 40);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Math.random() * 5 + 2;
            fireworkParticles.push(new FireworkParticle(
                this.x, this.y, this.color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
    }
    
    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
            fireworksCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            fireworksCtx.fill();
        }
        
        // Draw head
        fireworksCtx.beginPath();
        fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fireworksCtx.fillStyle = '#fff';
        fireworksCtx.fill();
    }
}

class FireworkParticle {
    constructor(x, y, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.alpha = 1;
        this.decay = 0.015 + Math.random() * 0.01;
        this.gravity = 0.05;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }
    
    draw() {
        fireworksCtx.save();
        fireworksCtx.globalAlpha = this.alpha;
        
        // Main particle
        fireworksCtx.beginPath();
        fireworksCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fireworksCtx.fillStyle = this.color;
        fireworksCtx.fill();
        
        // Glow
        fireworksCtx.beginPath();
        fireworksCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        fireworksCtx.fillStyle = this.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
        fireworksCtx.fill();
        
        fireworksCtx.restore();
    }
}

function launchFirework() {
    const x = Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
    const targetY = Math.random() * (window.innerHeight * 0.4) + 50;
    fireworks.push(new Firework(x, targetY));
}

function animateFireworks() {
    fireworksCtx.fillStyle = 'rgba(13, 0, 21, 0.15)';
    fireworksCtx.fillRect(0, 0, elements.fireworksCanvas.width, elements.fireworksCanvas.height);
    
    // Update and draw fireworks
    fireworks = fireworks.filter(fw => {
        if (!fw.exploded) {
            fw.update();
            fw.draw();
            return !fw.exploded;
        }
        return false;
    });
    
    // Update and draw particles
    fireworkParticles = fireworkParticles.filter(p => {
        if (p.alpha > 0) {
            p.update();
            p.draw();
            return true;
        }
        return false;
    });
    
    requestAnimationFrame(animateFireworks);
}

// ===== Snowfall Effect =====
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = '❄';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.fontSize = (Math.random() * 10 + 8) + 'px';
    snowflake.style.animationDuration = (Math.random() * 5 + 8) + 's';
    snowflake.style.animationDelay = Math.random() * 5 + 's';
    
    elements.snowContainer.appendChild(snowflake);
    
    setTimeout(() => snowflake.remove(), 15000);
}

function initSnow() {
    for (let i = 0; i < 30; i++) {
        setTimeout(createSnowflake, i * 200);
    }
    setInterval(createSnowflake, 300);
}

// ===== Floating Hearts =====
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = CONFIG.heartEmojis[Math.floor(Math.random() * CONFIG.heartEmojis.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
    heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
    heart.style.color = `hsl(${Math.random() * 60 + 320}, 80%, 65%)`;
    
    elements.floatingElements.appendChild(heart);
    
    setTimeout(() => heart.remove(), 15000);
}

function initFloatingHearts() {
    setInterval(createFloatingHeart, 800);
}

// ===== Celebration Effects =====
let celebrationTriggered = false;

function triggerCelebration() {
    if (celebrationTriggered) return;
    celebrationTriggered = true;
    
    // Rapid fireworks
    for (let i = 0; i < 15; i++) {
        setTimeout(launchFirework, i * 150);
    }
    
    // Create confetti
    createConfetti();
}

function createConfetti() {
    const colors = ['#e91e63', '#ff6090', '#ffd700', '#9c27b0', '#00bcd4', '#ff9800', '#4caf50'];
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            const size = Math.random() * 12 + 5;
            const isCircle = Math.random() > 0.5;
            
            confetti.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${isCircle ? size : size * 0.6}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -20px;
                z-index: 1000;
                pointer-events: none;
                border-radius: ${isCircle ? '50%' : '2px'};
                animation: confettiFall ${Math.random() * 3 + 3}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 6000);
        }, i * 20);
    }
}

// Add confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// ===== Music Player =====
let isPlaying = false;
let titleTimeout = null;

const musicElements = {
    player: document.getElementById('musicPlayer'),
    btn: document.getElementById('musicBtn'),
    title: document.getElementById('musicTitle'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    audio: document.getElementById('bgMusic')
};

function updateMusicIcons() {
    if (isPlaying) {
        musicElements.playIcon.style.display = 'none';
        musicElements.pauseIcon.style.display = 'block';
        musicElements.btn.classList.add('playing');
    } else {
        musicElements.playIcon.style.display = 'block';
        musicElements.pauseIcon.style.display = 'none';
        musicElements.btn.classList.remove('playing');
    }
}

function showMusicTitle() {
    musicElements.title.classList.add('show');
    
    // Clear existing timeout
    if (titleTimeout) {
        clearTimeout(titleTimeout);
    }
    
    // Auto-hide after 3 seconds (for mobile)
    titleTimeout = setTimeout(() => {
        musicElements.title.classList.remove('show');
    }, 3000);
}

function toggleMusic() {
    if (isPlaying) {
        musicElements.audio.pause();
    } else {
        musicElements.audio.play().catch(e => console.log('Audio play prevented:', e));
    }
    isPlaying = !isPlaying;
    updateMusicIcons();
    showMusicTitle();
}

// Click handler
musicElements.btn.addEventListener('click', toggleMusic);

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.letter-container, .wish-card, .quote-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

// ===== Mouse Sparkle Effect =====
let sparkleThrottle = false;

document.addEventListener('mousemove', (e) => {
    if (sparkleThrottle) return;
    if (Math.random() > 0.92) {
        createSparkle(e.clientX, e.clientY);
        sparkleThrottle = true;
        setTimeout(() => sparkleThrottle = false, 50);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    const symbols = ['✨', '⭐', '💫', '✦'];
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.cssText = `
        position: fixed;
        pointer-events: none;
        font-size: ${Math.random() * 10 + 10}px;
        left: ${x}px;
        top: ${y}px;
        z-index: 9999;
        animation: sparkleAnim 0.8s ease-out forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
}

const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleAnim {
        0% { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0) translateY(-30px) rotate(180deg); }
    }
`;
document.head.appendChild(sparkleStyle);

// ===== Window Resize Handler =====
window.addEventListener('resize', () => {
    initParticleCanvas();
    initFireworksCanvas();
});

// ===== Initialize Everything =====
function init() {
    initParticleCanvas();
    initFireworksCanvas();
    initParticles();
    initSnow();
    initFloatingHearts();
    initScrollReveal();
    
    // Start animations
    animateParticles();
    animateFireworks();
    
    // Periodic fireworks
    setInterval(launchFirework, 1200);
    
    // Check if new year
    if (Date.now() >= CONFIG.targetDate) {
        elements.countdownWrapper.style.display = 'none';
        elements.celebration.style.display = 'block';
        triggerCelebration();
    }
    
    console.log('🎆 Happy New Year 2025! Made with ❤️');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
