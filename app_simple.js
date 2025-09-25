'use strict';

let isLoggedIn = false;
let currentUser = '';

const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// Setup navigasi dan mobile menu
const setupNavAndMobile = () => {
    const navToggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.menu');
    const yearEl = $('year');
    
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    if (navToggle && menu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            menu.setAttribute('aria-expanded', !isExpanded);
            navToggle.textContent = !isExpanded ? 'Tutup' : 'Menu';
        });
        
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-expanded', 'false');
                navToggle.textContent = 'Menu';
            });
        });
    }
};

// Sistem login sederhana
const setupAuth = () => {
    const loginBtn = $('loginBtn');
    const signUpBtn = $('signUpBtn');
    const loginForm = $('loginFormElement');
    const userInfo = $('userInfo');
    
    updateAuthUI();
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            doLogin();
        });
    }
    
    // Cek login status dari localStorage
    const savedUser = localStorage.getItem('phylab_user');
    if (savedUser) {
        currentUser = savedUser;
        isLoggedIn = true;
        updateAuthUI();
    }
    
    // Setup diskusi form
    const diskusiForm = $('diskusiForm');
    if (diskusiForm) {
        diskusiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!isLoggedIn) {
                alert('Silakan login terlebih dahulu untuk mengirim pertanyaan.');
                return;
            }
            addNewDiscussion();
        });
    }
};

// Update tampilan login/logout
const updateAuthUI = () => {
    const loginBtn = $('loginBtn');
    const signUpBtn = $('signUpBtn');
    const userInfo = $('userInfo');
    
    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signUpBtn) {
            signUpBtn.textContent = 'Logout';
            signUpBtn.onclick = doLogout;
            signUpBtn.className = 'ghost';
        }
        if (userInfo) userInfo.textContent = `Halo, ${currentUser}`;
        
        // Enable diskusi features
        const replyTextarea = $('replyInput');
        const replyButton = document.querySelector('#replyForm button');
        if (replyTextarea) replyTextarea.disabled = false;
        if (replyButton) replyButton.disabled = false;
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signUpBtn) {
            signUpBtn.textContent = 'Sign Up';
            signUpBtn.onclick = () => $('signUpDialog').showModal();
            signUpBtn.className = 'ghost';
        }
        if (userInfo) userInfo.textContent = '';
        
        // Disable diskusi features
        const replyTextarea = $('replyInput');
        const replyButton = document.querySelector('#replyForm button');
        if (replyTextarea) replyTextarea.disabled = true;
        if (replyButton) replyButton.disabled = true;
    }
};

// Proses login
const doLogin = () => {
    const username = $('username').value.trim();
    const password = $('password').value;
    const loginError = $('loginError');
    
    if (!username || !password) {
        showError(loginError, 'Username dan password harus diisi');
        return;
    }
    
    // Demo login sederhana
    currentUser = username;
    isLoggedIn = true;
    localStorage.setItem('phylab_user', username);
    
    updateAuthUI();
    $('loginDialog').close();
    $('loginFormElement').reset();
    
    if (loginError) loginError.style.display = 'none';
};

// Proses logout
const doLogout = () => {
    isLoggedIn = false;
    currentUser = '';
    localStorage.removeItem('phylab_user');
    updateAuthUI();
};

// Tampilkan error message
const showError = (errorEl, message) => {
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => errorEl.style.display = 'none', 5000);
    }
};

// Sistem diskusi
const discussionData = [
    {
        id: 1,
        title: 'Bagaimana cara menghitung percepatan pada gerak lurus berubah beraturan?',
        author: 'Mahasiswa A',
        date: '2025-01-15',
        replies: []
    },
    {
        id: 2,
        title: 'Apa perbedaan antara kecepatan dan percepatan?',
        author: 'Mahasiswa B',
        date: '2025-01-14',
        replies: []
    }
];

let nextDiscussionId = 3;

const renderDiscussions = () => {
    const discussionList = $('discussionList');
    if (!discussionList) return;
    
    discussionList.innerHTML = discussionData.map(discussion => `
        <div class="diskusi-item" onclick="showDiscussionDetail(${discussion.id})">
            <h3>${discussion.title}</h3>
            <p class="muted small">Oleh: ${discussion.author} • ${discussion.date}</p>
        </div>
    `).join('');
};

const addNewDiscussion = () => {
    const input = $('pertanyaanInput');
    if (!input || !input.value.trim()) return;
    
    const newDiscussion = {
        id: nextDiscussionId++,
        title: input.value.trim(),
        author: currentUser,
        date: new Date().toLocaleDateString('id-ID'),
        replies: []
    };
    
    discussionData.unshift(newDiscussion);
    renderDiscussions();
    input.value = '';
};

const showDiscussionDetail = (id) => {
    const discussion = discussionData.find(d => d.id === id);
    if (!discussion) return;
    
    $('discussionListView').style.display = 'none';
    $('discussionDetailView').style.display = 'block';
    $('detailTitle').textContent = discussion.title;
    
    const repliesContainer = $('detailReplies');
    repliesContainer.innerHTML = discussion.replies.length > 0 
        ? discussion.replies.map(reply => `
            <div class="reply">
                <p>${reply.content}</p>
                <p class="muted small">Oleh: ${reply.author} • ${reply.date}</p>
            </div>
        `).join('')
        : '<p class="muted">Belum ada balasan untuk diskusi ini.</p>';
};

// Event listener untuk back button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('back-link')) {
        e.preventDefault();
        $('discussionListView').style.display = 'block';
        $('discussionDetailView').style.display = 'none';
    }
});

// Fisika simulasi classes
class JatuhBebasSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        
        this.balls = [];
        this.gravity = 9.8;
        this.restitution = 0.8;
        this.airDrag = 0.004;
        this.scale = 20;
        
        this.init();
        this.setupEvents();
    }
    
    init() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Ensure minimum canvas size
        if (this.canvas.width < 400) this.canvas.width = 400;
        if (this.canvas.height < 300) this.canvas.height = 300;
        
        this.balls = [
            { x: 100, y: 50, vx: 2, vy: 0, radius: 10, color: '#60a5fa' },
            { x: 200, y: 80, vx: -1, vy: 0, radius: 12, color: '#f59e0b' },
            { x: 300, y: 60, vx: 0.5, vy: 0, radius: 8, color: '#10b981' }
        ];
        
        this.render();
    }
    
    setupEvents() {
        // Event listeners untuk kontrol
        const gSlider = $('g');
        const eSlider = $('e');
        const dragSlider = $('drag');
        
        if (gSlider) {
            gSlider.addEventListener('input', (e) => {
                this.gravity = parseFloat(e.target.value);
                $('gOut').textContent = this.gravity.toFixed(1);
            });
        }
        
        if (eSlider) {
            eSlider.addEventListener('input', (e) => {
                this.restitution = parseFloat(e.target.value);
                $('eOut').textContent = this.restitution.toFixed(2);
            });
        }
        
        if (dragSlider) {
            dragSlider.addEventListener('input', (e) => {
                this.airDrag = parseFloat(e.target.value);
                $('dragOut').textContent = this.airDrag.toFixed(3);
            });
        }
    }
    
    update(dt = 0.016) {
        this.balls.forEach(ball => {
            // Gravitasi
            ball.vy += this.gravity * dt;
            
            // Air drag
            ball.vx *= (1 - this.airDrag);
            ball.vy *= (1 - this.airDrag);
            
            // Update posisi
            ball.x += ball.vx * this.scale * dt;
            ball.y += ball.vy * this.scale * dt;
            
            // Collision dengan lantai
            if (ball.y + ball.radius > this.canvas.height) {
                ball.y = this.canvas.height - ball.radius;
                ball.vy *= -this.restitution;
            }
            
            // Collision dengan dinding
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
                ball.vx *= -this.restitution;
                ball.x = ball.x - ball.radius < 0 ? ball.radius : this.canvas.width - ball.radius;
            }
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(0, this.canvas.height - 2, this.canvas.width, 2);
        
        // Draw balls
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#1e293b';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    animate() {
        if (this.isRunning) {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.init();
    }
}

class ProyektilSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        
        this.projectile = null;
        this.trail = [];
        this.velocity = 50;
        this.angle = 45;
        this.initialHeight = 0;
        this.gravity = 9.8;
        this.scale = 3;
        
        this.init();
        this.setupEvents();
        this.updateCanvasSize();
    }
    
    updateCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 600;
        this.canvas.height = rect.height || 400;
        
        // Ensure minimum canvas size
        if (this.canvas.width < 400) this.canvas.width = 400;
        if (this.canvas.height < 300) this.canvas.height = 300;
        
        this.render();
    }
    
    init() {
        this.projectile = {
            x: 50,
            y: this.canvas.height - 50 - this.initialHeight * this.scale,
            vx: this.velocity * Math.cos(this.angle * Math.PI / 180),
            vy: -this.velocity * Math.sin(this.angle * Math.PI / 180),
            radius: 8,
            color: '#f59e0b'
        };
        this.trail = [];
        this.render();
    }
    
    setupEvents() {
        const velocitySlider = $('velocityProyektil');
        const angleSlider = $('angleProyektil');
        const heightSlider = $('heightProyektil');
        
        if (velocitySlider) {
            velocitySlider.addEventListener('input', (e) => {
                this.velocity = parseFloat(e.target.value);
                $('velocityProyektilOut').textContent = this.velocity;
                if (!this.isRunning) this.init();
            });
        }
        
        if (angleSlider) {
            angleSlider.addEventListener('input', (e) => {
                this.angle = parseFloat(e.target.value);
                $('angleProyektilOut').textContent = this.angle;
                if (!this.isRunning) this.init();
            });
        }
        
        if (heightSlider) {
            heightSlider.addEventListener('input', (e) => {
                this.initialHeight = parseFloat(e.target.value);
                $('heightProyektilOut').textContent = this.initialHeight;
                if (!this.isRunning) this.init();
            });
        }
        
        // Responsive canvas
        window.addEventListener('resize', () => this.updateCanvasSize());
    }
    
    update(dt = 0.016) {
        if (!this.projectile) return;
        
        // Add to trail
        if (this.trail.length > 100) this.trail.shift();
        this.trail.push({ x: this.projectile.x, y: this.projectile.y });
        
        // Physics
        this.projectile.vy += this.gravity * dt * this.scale;
        this.projectile.x += this.projectile.vx * dt * this.scale;
        this.projectile.y += this.projectile.vy * dt * this.scale;
        
        // Stop jika menyentuh tanah
        if (this.projectile.y > this.canvas.height - 50) {
            this.projectile.y = this.canvas.height - 50;
            this.pause();
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw trajectory prediction (dotted line)
        if (!this.isRunning) {
            this.drawTrajectoryPrediction();
        }
        
        // Draw ground
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Draw trail
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.trail.forEach((point, index) => {
            if (index === 0) this.ctx.moveTo(point.x, point.y);
            else this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.stroke();
        
        // Draw projectile
        if (this.projectile) {
            this.ctx.beginPath();
            this.ctx.arc(this.projectile.x, this.projectile.y, this.projectile.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.projectile.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#1e293b';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawTrajectoryPrediction() {
        const steps = 100;
        const dt = 0.1;
        let x = 50;
        let y = this.canvas.height - 50 - this.initialHeight * this.scale;
        let vx = this.velocity * Math.cos(this.angle * Math.PI / 180);
        let vy = -this.velocity * Math.sin(this.angle * Math.PI / 180);
        
        this.ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        for (let i = 0; i < steps; i++) {
            vy += this.gravity * dt * this.scale;
            x += vx * dt * this.scale;
            y += vy * dt * this.scale;
            
            if (y > this.canvas.height - 50) break;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    animate() {
        if (this.isRunning) {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.init();
    }
}

class PendulumSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        
        this.length = 1.5;
        this.mass = 1;
        this.damping = 0.02;
        this.gravity = 9.8;
        
        this.angle = Math.PI / 4; // 45 derajat
        this.angularVelocity = 0;
        this.scale = 100;
        
        this.init();
        this.setupEvents();
    }
    
    init() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Ensure minimum canvas size
        if (this.canvas.width < 400) this.canvas.width = 400;
        if (this.canvas.height < 300) this.canvas.height = 300;
        
        this.angle = Math.PI / 4;
        this.angularVelocity = 0;
        this.render();
    }
    
    setupEvents() {
        const lengthSlider = $('lengthPendulum');
        const massSlider = $('massPendulum');
        const dampingSlider = $('dampingPendulum');
        
        if (lengthSlider) {
            lengthSlider.addEventListener('input', (e) => {
                this.length = parseFloat(e.target.value);
                $('lengthPendulumOut').textContent = this.length;
                if (!this.isRunning) this.render();
            });
        }
        
        if (massSlider) {
            massSlider.addEventListener('input', (e) => {
                this.mass = parseFloat(e.target.value);
                $('massPendulumOut').textContent = this.mass;
            });
        }
        
        if (dampingSlider) {
            dampingSlider.addEventListener('input', (e) => {
                this.damping = parseFloat(e.target.value);
                $('dampingPendulumOut').textContent = this.damping.toFixed(2);
            });
        }
    }
    
    update(dt = 0.016) {
        // Persamaan gerak pendulum sederhana dengan redaman
        const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle) - this.damping * this.angularVelocity;
        
        this.angularVelocity += angularAcceleration * dt;
        this.angle += this.angularVelocity * dt;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = 50;
        const bobX = centerX + this.length * this.scale * Math.sin(this.angle);
        const bobY = centerY + this.length * this.scale * Math.cos(this.angle);
        
        // Draw pivot
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw string
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(bobX, bobY);
        this.ctx.stroke();
        
        // Draw bob
        const bobRadius = Math.max(8, this.mass * 6);
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw angle arc
        this.ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, this.angle);
        this.ctx.stroke();
    }
    
    animate() {
        if (this.isRunning) {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.init();
    }
}

// Lab manager
class LabManager {
    constructor() {
        this.simulations = {};
        this.activeTab = 'jatuh-bebas';
        this.init();
    }
    
    init() {
        this.setupTabs();
        this.initSimulations();
        this.setupControls();
        this.setupKeyboard();
    }
    
    setupTabs() {
        const tabs = $$('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const labType = e.target.dataset.lab;
                this.switchLab(labType);
            });
        });
    }
    
    switchLab(labType) {
        // Update active tab
        $$('.tab-btn').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-lab="${labType}"]`).classList.add('active');
        
        // Update active content
        $$('.lab-content').forEach(content => content.classList.remove('active'));
        $(labType).classList.add('active');
        
        this.activeTab = labType;
        
        // Initialize simulation jika belum ada
        if (!this.simulations[labType]) {
            this.initSimulation(labType);
        }
    }
    
    initSimulations() {
        this.initSimulation('jatuh-bebas');
    }
    
    initSimulation(labType) {
        let canvas, simulation;
        
        try {
            switch(labType) {
                case 'jatuh-bebas':
                    canvas = $('labCanvas');
                    if (canvas) {
                        this.simulations[labType] = new JatuhBebasSimulation(canvas);
                    }
                    break;
                case 'proyektil':
                    canvas = $('proyektilCanvas');
                    if (canvas) {
                        this.simulations[labType] = new ProyektilSimulation(canvas);
                    }
                    break;
                case 'pendulum':
                    canvas = $('pendulumCanvas');
                    if (canvas) {
                        this.simulations[labType] = new PendulumSimulation(canvas);
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error initializing ${labType} simulation:`, error);
        }
    }
    
    setupControls() {
        // Jatuh bebas controls
        const playBtn = $('play');
        const pauseBtn = $('pause');
        const resetBtn = $('reset');
        
        if (playBtn) playBtn.addEventListener('click', () => this.startSimulation('jatuh-bebas'));
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseSimulation('jatuh-bebas'));
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSimulation('jatuh-bebas'));
        
        // Proyektil controls
        const playProyektilBtn = $('playProyektil');
        const resetProyektilBtn = $('resetProyektil');
        
        if (playProyektilBtn) playProyektilBtn.addEventListener('click', () => this.startSimulation('proyektil'));
        if (resetProyektilBtn) resetProyektilBtn.addEventListener('click', () => this.resetSimulation('proyektil'));
        
        // Pendulum controls
        const playPendulumBtn = $('playPendulum');
        const resetPendulumBtn = $('resetPendulum');
        
        if (playPendulumBtn) playPendulumBtn.addEventListener('click', () => this.startSimulation('pendulum'));
        if (resetPendulumBtn) resetPendulumBtn.addEventListener('click', () => this.resetSimulation('pendulum'));
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleSimulation(this.activeTab);
            }
        });
        
        // Tambah resize handler untuk semua simulasi
        window.addEventListener('resize', () => {
            Object.keys(this.simulations).forEach(key => {
                const sim = this.simulations[key];
                if (sim && sim.updateCanvasSize) {
                    sim.updateCanvasSize();
                } else if (sim && sim.init) {
                    sim.init();
                }
            });
        });
    }
    
    startSimulation(labType) {
        if (!this.simulations[labType]) {
            // Show loading state
            const canvas = $(labType === 'jatuh-bebas' ? 'labCanvas' : labType === 'proyektil' ? 'proyektilCanvas' : 'pendulumCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#64748b';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Memuat simulasi...', canvas.width / 2, canvas.height / 2);
            }
            
            this.initSimulation(labType);
        }
        if (this.simulations[labType]) {
            this.simulations[labType].start();
        }
    }
    
    pauseSimulation(labType) {
        if (this.simulations[labType]) {
            this.simulations[labType].pause();
        }
    }
    
    resetSimulation(labType) {
        if (this.simulations[labType]) {
            this.simulations[labType].reset();
        }
    }
    
    toggleSimulation(labType) {
        if (!this.simulations[labType]) {
            this.initSimulation(labType);
        }
        const sim = this.simulations[labType];
        if (sim && sim.isRunning) {
            sim.pause();
        } else if (sim) {
            sim.start();
        }
    }
}

// Initialize semuanya setelah DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    setupNavAndMobile();
    setupAuth();
    renderDiscussions();
    
    const labManager = new LabManager();
    
    // Smooth scrolling untuk anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Fade in animation untuk sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(section => {
        observer.observe(section);
    });
});
