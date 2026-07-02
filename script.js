document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Smooth Scrolling ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ---------- Navbar Shrink & Hide on Scroll ---------- */
    const nav = document.querySelector('.glass-nav');
    let lastScroll = 0;
    const scrollHandler = () => {
        const curScroll = window.scrollY;
        // shrink & backdrop blur
        if (curScroll > 80) {
            nav.classList.add('shrink');
        } else {
            nav.classList.remove('shrink');
        }
        // hide on scroll down, show on scroll up
        if (curScroll > lastScroll && curScroll > 100) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }
        lastScroll = curScroll;
    };
    window.addEventListener('scroll', scrollHandler);

    /* ---------- Hamburger Menu Toggle ---------- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    /* ---------- Reveal on Scroll (IntersectionObserver) ---------- */
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const index = Array.from(revealElements).indexOf(el);
                const delay = index * 100; // 100ms per element
                setTimeout(() => el.classList.add('visible'), delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    /* ---------- Stat Counters ---------- */
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target || el.textContent, 10) || 0;
                const duration = 2000;
                const start = performance.now();
                const startVal = 0;
                const step = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    el.textContent = Math.floor(progress * (target - startVal) + startVal);
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target;
                    }
                };
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.6 });
    statNumbers.forEach(el => counterObserver.observe(el));

    /* ---------- Gallery Lightbox ---------- */
    const galleryImgs = Array.from(document.querySelectorAll('#galleria .grid-3 img'));
    if (galleryImgs.length) {
        const overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100vw;height:100vh;
            background:rgba(0,0,0,0.9);display:flex;align-items:center;
            justify-content:center;z-index:1000;opacity:0;pointer-events:none;
            transition:opacity .3s ease;
        `;
        const img = document.createElement('img');
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        overlay.appendChild(img);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position:absolute;top:20px;right:20px;font-size:2rem;
            background:none;border:none;color:#fff;cursor:pointer;
        `;
        overlay.appendChild(closeBtn);

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.style.cssText = `
            position:absolute;left:20px;top:50%;transform:translateY(-50%);
            font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;
        `;
        overlay.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.style.cssText = `
            position:absolute;right:20px;top:50%;transform:translateY(-50%);
            font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;
        `;
        overlay.appendChild(nextBtn);

        document.body.appendChild(overlay);

        let currentIdx = 0;
        const openLightbox = (idx) => {
            currentIdx = idx;
            img.src = galleryImgs[currentIdx].src;
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        };
        const closeLightbox = () => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        };
        const showPrev = () => {
            currentIdx = (currentIdx - 1 + galleryImgs.length) % galleryImgs.length;
            img.src = galleryImgs[currentIdx].src;
        };
        const showNext = () => {
            currentIdx = (currentIdx + 1) % galleryImgs.length;
            img.src = galleryImgs[currentIdx].src;
        };

        galleryImgs.forEach((image, i) => {
            image.style.cursor = 'pointer';
            image.addEventListener('click', () => openLightbox(i));
        });
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeLightbox();
        });
        document.addEventListener('keydown', e => {
            if (overlay.style.pointerEvents === 'auto') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showPrev();
                if (e.key === 'ArrowRight') showNext();
            }
        });
    }

    /* ---------- Form Validation & Success Message ---------- */
    const form = document.querySelector('form#contact-form');
    if (form) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Kiitos! Viestisi on lähetetty.';
        successMsg.style.cssText = `
            opacity:0;transition:opacity .5s ease;
            background:var(--surface);color:var(--text);
            padding:1rem;margin-top:1rem;border-radius:var(--radius);
        `;
        form.parentNode.insertBefore(successMsg, form.nextSibling);

        form.addEventListener('submit', e => {
            e.preventDefault();
            let valid = true;
            form.querySelectorAll('input, textarea').forEach(inp => {
                if (inp.hasAttribute('required') && !inp.value.trim()) {
                    valid = false;
                    inp.classList.add('error');
                } else {
                    inp.classList.remove('error');
                }
            });
            if (valid) {
                // simulate async submission
                setTimeout(() => {
                    successMsg.style.opacity = '1';
                    form.reset();
                }, 300);
            }
        });
    }
});