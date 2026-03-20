document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Canvas Interactive Data Stream Background ---
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    const connectionDistance = 140;
    
    // Mouse Interaction
    let mouse = { x: -1000, y: -1000, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });
    
    function initCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        particles = [];
        // More particles for a stronger dense field, up to 100
        let numParticles = Math.floor((width * height) / 15000); 
        if (numParticles > 100) numParticles = 100;
        if (numParticles < 40) numParticles = 40;
        
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: Math.random() * 0.4 + 0.1, // Drift right
                vy: Math.random() * -0.4 - 0.1, // Drift up
                radius: Math.random() * 2 + 1,
                // Add varied colors (cyan and purple accents)
                baseColor: Math.random() > 0.8 ? 'rgba(189, 147, 249, 0.8)' : 'rgba(100, 255, 218, 0.8)'
            });
        }
    }
    
    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            
            // Mouse Repulsion
            let dxMouse = mouse.x - p.x;
            let dyMouse = mouse.y - p.y;
            let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distMouse < mouse.radius) {
                const force = (mouse.radius - distMouse) / mouse.radius;
                const angle = Math.atan2(dyMouse, dxMouse);
                p.x -= Math.cos(angle) * force * 3;
                p.y -= Math.sin(angle) * force * 3;
            }
            
            // Apply drift
            p.x += p.vx;
            p.y += p.vy;
            
            // Screen wrap (flowing data stream effect) instead of bounce
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.baseColor;
            ctx.fill();
            
            // Interconnect nodes
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSquared = dx * dx + dy * dy;
                
                if (distSquared < connectionDistance * connectionDistance) {
                    const dist = Math.sqrt(distSquared);
                    const alpha = 1 - (dist / connectionDistance);
                    
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    // Style connection based on distance and purple accent
                    const isPurple = (i % 4 === 0);
                    ctx.strokeStyle = isPurple 
                        ? `rgba(189, 147, 249, ${alpha * 0.4})` 
                        : `rgba(100, 255, 218, ${alpha * 0.4})`;
                        
                    ctx.lineWidth = alpha * 1.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateCanvas);
    }
    
    initCanvas();
    animateCanvas();
    
    // Debounce resize to prevent lag
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initCanvas, 200);
    });

    // --- 2. Mouse Glow Effect on Cards ---
    // Use requestAnimationFrame for smooth CSS updates without layout thrashing
    document.querySelectorAll('.glowing-border').forEach(card => {
        card.addEventListener('mousemove', e => {
            // offsetX and offsetY are much faster than getBoundingClientRect()
            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${e.offsetX}px`);
                card.style.setProperty('--mouse-y', `${e.offsetY}px`);
            });
        });
    });

    // --- 3. Typewriter Effect ---
    const typewriterElement = document.querySelector('.typewriter-text');
    const words = ["Intelligent Systems", "AI Models", "Scalable Web Apps", "Data Solutions"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeWriter() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start typing effect slightly after load
    setTimeout(typeWriter, 1000);

    // --- 4. Scroll Animations & Navbar ---
    const nav = document.querySelector('nav');
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
                isTicking = false;
            });
            isTicking = true;
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
    
    // Hero section immediate reveal
    setTimeout(() => {
        const hero = document.querySelector('.hero-content');
        if (hero) hero.classList.add('appear');
    }, 100);
});
