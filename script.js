// LoopForgeLab Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
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
        link.addEventListener('click', function(e) {
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

    
    
    // Newsletter Form Handling
    const newsLetterForms = document.querySelectorAll('.newsletter-form');
    
    newsLetterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
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
        link.addEventListener('click', function() {
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
    document.addEventListener('keydown', function(e) {
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
        img.addEventListener('error', function() {
            // Create a placeholder if image fails to load
            this.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.alt = this.alt || 'Image placeholder';
            this.title = 'Image not available';
        });
    });
    
    console.log('LoopForgeLab landing page initialized successfully! 🌱');
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