// LoopForgeLab Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function () {

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling for Anchor Links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Background on Scroll
    const header = document.querySelector('.header');
    let scrollTimer = null;

    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Clear the timer if it's already set
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }

        // Set a timer to run after scrolling ends
        scrollTimer = setTimeout(() => {
            header.style.transition = 'all 0.3s ease';
        }, 150);
    }

    window.addEventListener('scroll', handleScroll);

    // How It Works — scroll-triggered reveals
    // On mobile the cards are in a slider, so force immediate visibility
    const isMobileHIW = window.innerWidth <= 640;
    const howItWorksIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('vis');

            if (e.target.classList.contains('how-it-works-path')) {
                const steps = e.target.querySelectorAll('.how-it-works-p-step');
                const delay = isMobileHIW ? 0 : 150; // no delay on mobile
                steps.forEach((s, i) => {
                    setTimeout(() => s.classList.add('vis'), delay + i * (isMobileHIW ? 0 : 120));
                });
                const res = e.target.querySelector('.how-it-works-result');
                if (res) setTimeout(() => res.classList.add('vis'), isMobileHIW ? 0 : 200 + steps.length * 120);
            }

            howItWorksIO.unobserve(e.target);
        });
    }, { threshold: isMobileHIW ? 0.05 : 0.2 });

    // On mobile: immediately force vis on both HIW cards so slider reveals content at once
    if (isMobileHIW) {
        ['#how-it-works-path-today', '#how-it-works-path-tri'].forEach(sel => {
            const el = document.querySelector(sel);
            if (!el) return;
            el.classList.add('vis');
            el.querySelectorAll('.how-it-works-p-step, .how-it-works-result').forEach(s => s.classList.add('vis'));
        });
    }

    ['#how-it-works-title', '#how-it-works-sub', '#how-it-works-origin', '#how-it-works-fork', '#how-it-works-path-today', '#how-it-works-path-tri'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) howItWorksIO.observe(el);
    });

    // Newsletter Form Handling
    const newsLetterForms = document.querySelectorAll('.newsletter-form');

    newsLetterForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                showFormMessage(this, 'Please enter a valid email address.', 'error');
                return;
            }

            // Disable button and show loading state
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';

            // Simulate API call (replace with actual endpoint)
            setTimeout(() => {
                showFormMessage(this, 'Thank you for subscribing! We\'ll be in touch soon.', 'success');
                emailInput.value = '';
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 1500);
        });
    });

    // Form Message Display Helper
    function showFormMessage(form, message, type) {
        // Remove existing message
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            ${type === 'success'
                ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;'
                : 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
            }
        `;

        form.appendChild(messageElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement && messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.focus-card, .founder-card, .involvement-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Partners Carousel Pause on Hover
    const partnersTrack = document.querySelector('.partners-track');
    if (partnersTrack) {
        partnersTrack.addEventListener('mouseenter', () => {
            partnersTrack.style.animationPlayState = 'paused';
        });

        partnersTrack.addEventListener('mouseleave', () => {
            partnersTrack.style.animationPlayState = 'running';
        });
    }

    // Contact Links Enhancement
    const contactLinks = document.querySelectorAll('a[href^="mailto:"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Track email link clicks (replace with actual analytics)
            console.log('Email contact clicked:', this.href);
        });
    });

    // Scroll Progress Indicator (optional enhancement)
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--accent-orange, #d97706);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = Math.min(scrolled, 100) + '%';
        });
    }

    // Uncomment to enable scroll progress indicator
    // createScrollProgress();

    // Keyboard Navigation Enhancement
    document.addEventListener('keydown', function (e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Performance: Lazy load images when they come into view
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Error Handling for Missing Images
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        img.addEventListener('error', function () {
            // Create a placeholder if image fails to load
            this.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.alt = this.alt || 'Image placeholder';
            this.title = 'Image not available';
        });
    });

    // Modal Functionality (Impressum & Disclaimer)
    const impressumModal = document.getElementById('impressum-modal');
    const impressumLink = document.getElementById('impressum-link');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const disclaimerLink = document.getElementById('disclaimer-link');
    const closeBtns = document.querySelectorAll('.close');

    // Function to close any modal
    function closeModal() {
        impressumModal.style.display = 'none';
        disclaimerModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Open Impressum modal
    if (impressumLink && impressumModal) {
        impressumLink.addEventListener('click', function (e) {
            e.preventDefault();
            impressumModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Open Disclaimer modal
    if (disclaimerLink && disclaimerModal) {
        disclaimerLink.addEventListener('click', function (e) {
            e.preventDefault();
            disclaimerModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modals when X is clicked
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside of it
    [impressumModal, disclaimerModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' &&
            (impressumModal.style.display === 'block' || disclaimerModal.style.display === 'block')) {
            closeModal();
        }
    });

    // Split Slider Logic for Problem Section
    const splitSlider = document.getElementById('split-slider');
    const splitBefore = document.getElementById('split-before');
    const splitHandle = document.getElementById('split-slider-handle');

    if (splitSlider && splitBefore && splitHandle) {
        let isDown = false;

        const moveSlider = (e) => {
            if (!isDown) return;
            e.preventDefault();
            let clientX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            const sliderRect = splitSlider.getBoundingClientRect();
            let x = clientX - sliderRect.left;
            if (x < 0) x = 0;
            if (x > sliderRect.width) x = sliderRect.width;
            const percent = (x / sliderRect.width) * 100;
            splitBefore.style.width = `${percent}%`;
            splitHandle.style.left = `${percent}%`;
        };

        splitHandle.addEventListener('mousedown', () => isDown = true);
        window.addEventListener('mouseup', () => isDown = false);
        window.addEventListener('mousemove', moveSlider);

        splitHandle.addEventListener('touchstart', () => isDown = true, { passive: true });
        window.addEventListener('touchend', () => isDown = false);
        window.addEventListener('touchmove', moveSlider, { passive: false });
    }

    // Enhancement loader: keep initial render fast by loading heavy libraries
    // (React/ReactDOM/Three + their components) after first paint/idle.
    // This directly targets Lighthouse "render-blocking requests" and LCP delay.
    (function scheduleEnhancements() {
        const shouldReduceMotion =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // If the user prefers reduced motion, skip heavy hero animations entirely.
        if (shouldReduceMotion) return;

        const loadScript = (src, attrs = {}) => new Promise((resolve, reject) => {
            // Don't double-inject.
            if ([...document.scripts].some(s => s.src === src)) {
                resolve();
                return;
            }

            const s = document.createElement('script');
            s.src = src;
            s.async = true; // async is fine here because we chain with Promises
            Object.entries(attrs).forEach(([k, v]) => {
                if (v === true) s.setAttribute(k, '');
                else if (v != null) s.setAttribute(k, String(v));
            });
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
        });

        const loadEnhancements = async () => {
            // If these targets don't exist, don't load the libs at all.
            const needsHero = !!document.getElementById('hero-3d-container');
            const needsStatusQuo = !!document.getElementById('status-quo-container');
            if (!needsHero && !needsStatusQuo) return;

            // React first (StatusQuoGap and TorchHero both depend on it)
            await loadScript('https://unpkg.com/react@18/umd/react.production.min.js', { crossorigin: '' });
            await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', { crossorigin: '' });

            // Three only if the hero exists (TorchHero depends on THREE)
            if (needsHero) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
                await loadScript('TorchHero.js');
            }

            // Below-the-fold section; safe to load after React.
            if (needsStatusQuo) {
                await loadScript('StatusQuoGap.js');
            }
        };

        // Prefer: wait for first paint, then idle.
        const run = () => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => { loadEnhancements().catch(() => { }); }, { timeout: 2500 });
            } else {
                // Fallback: give the browser a moment to render before loading.
                setTimeout(() => { loadEnhancements().catch(() => { }); }, 1200);
            }
        };

        // If load event fires later, that's ok — but we try to start earlier than full load.
        if (document.readyState === 'complete') run();
        else setTimeout(run, 0);
    })();
});

// Utility Functions
function debounce(func, wait) {
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

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce
    };
}
// How It Works — Mobile drag-reveal slider
// Status Quo is on the LEFT (bottom layer), LFL is on the RIGHT (top layer).
// The LFL card is clipped from the LEFT — dragging right reveals more of it.
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('hiw-slider-wrapper');
    const handle  = document.getElementById('hiw-slider-handle');
    const cardLFL = document.getElementById('how-it-works-path-tri');

    if (!wrapper || !handle || !cardLFL) return;

    let dragging = false;

    function applyPosition(clientX) {
        const rect = wrapper.getBoundingClientRect();
        let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = (x / rect.width) * 100;
        // Move the divider line
        handle.style.left = pct + '%';
        // Clip LFL card from the LEFT side.
        // inset(top right bottom left) — left = (100-pct)%
        // At pct=50: left-clip=50% → right half of LFL visible (LFL on right)
        // Drag right (pct→100): left-clip→0% → all LFL visible
        // Drag left  (pct→0):  left-clip→100% → LFL hidden (Status Quo fully visible)
        cardLFL.style.clipPath = `inset(0 0 0 ${100 - pct}%)`;
    }

    // Only activate on mobile
    function isMobile() { return window.innerWidth <= 640; }

    handle.addEventListener('mousedown', (e) => {
        if (!isMobile()) return;
        dragging = true;
        e.preventDefault();
    });

    handle.addEventListener('touchstart', (e) => {
        if (!isMobile()) return;
        dragging = true;
        document.body.style.overflow = 'hidden';
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        if (dragging) applyPosition(e.clientX);
    });

    window.addEventListener('touchmove', (e) => {
        if (dragging && e.touches.length > 0) {
            e.preventDefault();
            applyPosition(e.touches[0].clientX);
        }
    }, { passive: false });

    window.addEventListener('mouseup',    () => { dragging = false; });
    window.addEventListener('touchend',   () => { dragging = false; document.body.style.overflow = ''; });
    window.addEventListener('touchcancel',() => { dragging = false; document.body.style.overflow = ''; });
});

