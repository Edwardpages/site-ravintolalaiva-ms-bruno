/* ==== Utility Functions ==== */
const on = (el, ev, fn) => el.addEventListener(ev, fn);
const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => Array.from(p.querySelectorAll(s));

/* ==== 1. IntersectionObserver for .reveal ==== */
(() => {
    const revealElems = qsa('.reveal');
    if (!revealElems.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.delay || 0;
                setTimeout(() => el.classList.add('visible'), delay);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    // Staggered delay based on order if not manually set
    revealElems.forEach((el, i) => {
        if (!el.dataset.delay) el.dataset.delay = i * 100; // 100ms step
        observer.observe(el);
    });
})();

/* ==== 2. Navbar behavior (shrink, blur, hide on scroll) ==== */
(() => {
    const header = qs('.glass-nav');
    if (!header) return;

    let lastScroll = 0;
    const hideThreshold = 80; // px after which shrink/blur applies

    const onScroll = () => {
        const curScroll = window.scrollY;

        // Shrink & blur after threshold
        if (curScroll > hideThreshold) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }

        // Hide on scroll down, show on scroll up
        if (curScroll > lastScroll && curScroll > hideThreshold) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        lastScroll = curScroll <= 0 ? 0 : curScroll;
    };

    on(window, 'scroll', onScroll);
})();

/* ==== 3. Hamburger menu toggle ==== */
(() => {
    const hamburger = qs('.hamburger');
    const navLinks = qs('.nav-links');
    if (!hamburger || !navLinks) return;

    on(hamburger, 'click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
})();

/* ==== 4. Stat counters (count-up) ==== */
(() => {
    const counters = qsa('.stat-number');
    if (!counters.length) return;

    const animateCount = (el, target, duration = 2000) => {
        const start = 0;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = value;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10) || 0;
                animateCount(el, target);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(el => {
        // Expect data-target attribute with final number
        if (!el.dataset.target) el.dataset.target = el.textContent.trim();
        observer.observe(el);
    });
})();

/* ==== 5. Gallery Lightbox ==== */
(() => {
    const galleryItems = qsa('.gallery-item');
    if (!galleryItems.length) return;

    // Create lightbox elements
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
        <img class="lightbox-image" src="" alt="">
        <button class="lightbox-next" aria-label="Next">&#10095;</button>
    `;
    document.body.appendChild(overlay);

    const imgEl = qs('.lightbox-image', overlay);
    const closeBtn = qs('.lightbox-close', overlay);
    const prevBtn = qs('.lightbox-prev', overlay);
    const nextBtn = qs('.lightbox-next', overlay);

    let currentIndex = -1;
    const sources = galleryItems.map(item => {
        const img = qs('img', item);
        return img ? img.src : '';
    });

    const openLightbox = (index) => {
        if (index < 0 || index >= sources.length) return;
        currentIndex = index;
        imgEl.src = sources[index];
        overlay.classList.add('open');
    };

    const closeLightbox = () => {
        overlay.classList.remove('open');
    };

    const showPrev = () => {
        openLightbox((currentIndex - 1 + sources.length) % sources.length);
    };
    const showNext = () => {
        openLightbox((currentIndex + 1) % sources.length);
    };

    galleryItems.forEach((item, idx) => {
        on(item, 'click', (e) => {
            e.preventDefault();
            openLightbox(idx);
        });
    });

    on(closeBtn, 'click', closeLightbox);
    on(prevBtn, 'click', showPrev);
    on(nextBtn, 'click', showNext);
    on(overlay, 'click', (e) => {
        if (e.target === overlay) closeLightbox();
    });

    // Keyboard navigation
    on(document, 'keydown', (e) => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') showPrev();
        else if (e.key === 'ArrowRight') showNext();
    });
})();

/* ==== 6. Form validation + success message ==== */
(() => {
    const form = qs('section#contact form');
    if (!form) return;

    const showMessage = (msg) => {
        const msgEl = document.createElement('div');
        msgEl.className = 'form-success fade-in';
        msgEl.textContent = msg;
        form.parentNode.insertBefore(msgEl, form);
        setTimeout(() => msgEl.classList.add('visible'), 10);
        // Remove after 5s
        setTimeout(() => {
            msgEl.classList.remove('visible');
            setTimeout(() => msgEl.remove(), 500);
        }, 5000);
    };

    const validate = () => {
        const name = qs('#name', form);
        const email = qs('#email', form);
        const phone = qs('#phone', form);
        let valid = true;

        // Simple validation
        if (!name.value.trim()) { valid = false; name.classList.add('error'); }
        else name.classList.remove('error');

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) { valid = false; email.classList.add('error'); }
        else email.classList.remove('error');

        if (!phone.value.trim()) { valid = false; phone.classList.add('error'); }
        else phone.classList.remove('error');

        return valid;
    };

    on(form, 'submit', (e) => {
        e.preventDefault();
        if (validate()) {
            // Simulate async submission
            setTimeout(() => {
                form.reset();
                showMessage('Kiitos viestistäsi! Otamme yhteyttä pian.');
            }, 300);
        }
    });
})();

/* ==== 7. Smooth scrolling for internal links ==== */
(() => {
    const internalLinks = qsa('a[href^="#"]');
    internalLinks.forEach(link => {
        on(link, 'click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
                // Update URL hash without jumping
                history.pushState(null, '', `#${targetId}`);
            }
        });
    });
})();