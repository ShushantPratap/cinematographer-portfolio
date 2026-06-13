// =========================================
// 100% NATIVE JS ENGINE (NO GSAP REQUIRED)
// =========================================

// 1. Navbar Scroll Effect & Hamburger Menu
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.custom-nav');
    if (nav) {
        if (window.scrollY > 50) nav.classList.add('nav-scrolled');
        else nav.classList.remove('nav-scrolled');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-item');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => navbarCollapse.classList.toggle('show'));
        navLinks.forEach(link => {
            link.addEventListener('click', () => navbarCollapse.classList.remove('show'));
        });
    }
});

// 2. Main Setup (Runs when page is fully loaded)
window.addEventListener("load", () => {
    
    // -- Custom Cursor (CENTER ALIGNMENT FIX) --
    const cursor = document.querySelector('.custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    if(cursor) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const tick = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            
            // जादुई फिक्स: यहाँ translate(-50%, -50%) जोड़ दिया है ताकि यह हमेशा माउस के बिल्कुल बीच में रहे
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            
            requestAnimationFrame(tick);
        };
        tick();

        document.querySelectorAll('a, button, .portfolio-item').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // -- Preloader Fade Out & Sequenced Animation --
    const progressBar = document.querySelector(".progress-bar");
    const preloader = document.querySelector(".preloader");
    
    // 1. प्रोग्रेस बार को 1 सेकंड में पूरा करें
    if (progressBar) progressBar.style.width = "100%";
    
    setTimeout(() => {
        // 2. 1 सेकंड बाद प्रीलोडर (काली स्क्रीन) को ऊपर सरकाएं
        if (preloader) preloader.classList.add("hidden"); 
        
        // 3. जादुई ट्रिक: प्रीलोडर के जाने का इंतज़ार करें (800ms), उसके बाद ही टेक्स्ट लाएं
        setTimeout(() => {
            // हीरो सेक्शन एनीमेशन
            const heroElems = document.querySelectorAll(".hero-title, .hero-subtitle, .custom-btn");
            heroElems.forEach((el, index) => {
                if(el.animate) {
                    el.animate([
                        { transform: 'translateY(50px)', opacity: 0 },
                        { transform: 'translateY(0)', opacity: 1 }
                    ], { 
                        duration: 1000, 
                        delay: index * 200, 
                        easing: 'cubic-bezier(0.16, 1, 0.3, 1)', 
                        fill: 'forwards' 
                    });
                }
            });

            // नेविगेशन बार एनीमेशन
            const navElems = document.querySelectorAll(".logo-text, .navbar-toggler, .nav-item");
            navElems.forEach((el, index) => {
                if(el.animate) {
                    el.animate([
                        { transform: 'translateY(-20px)', opacity: 0 },
                        { transform: 'translateY(0)', opacity: 1 }
                    ], { 
                        duration: 1000, 
                        delay: index * 100, 
                        easing: 'ease-out', 
                        fill: 'forwards' 
                    });
                }
            });
        }, 800); // 800ms का डिले, ताकि प्रीलोडर स्क्रीन से पूरा हट जाए
        
    }, 1000);

    // -- Hero Parallax (Native GPU) --
    const heroImg = document.querySelector(".hero-bg img");
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking && heroImg && window.scrollY < window.innerHeight) {
            window.requestAnimationFrame(() => {
                heroImg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // -- Native Scroll Reveal (PERFECT TIMING FIX) --
    const revealElements = document.querySelectorAll('.gs-reveal, .gs-reveal-card');
    
    // rootMargin में -100px का मतलब है कि जब आइटम स्क्रीन में 100px ऊपर आ जाएगा, तभी एनीमेशन शुरू होगा
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); 
            }
        });
    }, observerOptions);

    revealElements.forEach((elem) => {
        scrollObserver.observe(elem);
    });

    // Top पर जाने पर रीसेट
    window.addEventListener('scroll', () => {
        if (window.scrollY < 50) { 
            revealElements.forEach((elem) => {
                elem.classList.remove('active'); 
            });
        }
    });

});

// ==================================================
// SMART GALLERY RENDER (WITH 'LOAD MORE' & LAZY LOAD)
// ==================================================
let currentGalleryImages = [];
let currentImageIndex = 0;

// Pagination Variables (Load More के लिए)
let currentPage = 1;
let itemsPerPage = 6; // एक बार में कितने वीडियो/फोटो दिखाने हैं (आप इसे 9 भी कर सकते हैं)
let currentFilter = 'all';
let filteredProjects = [];

document.addEventListener("DOMContentLoaded", () => {
    // Lightbox HTML (अगर नहीं है तो जोड़ें)
    if (!document.getElementById('lightbox')) {
        const lightboxHTML = `
            <div class="lightbox" id="lightbox">
                <i class="fa-solid fa-xmark lightbox-close" onclick="closeLightbox()"></i>
                <div class="lightbox-nav lightbox-prev" onclick="changeLightboxImage(-1)">
                    <i class="fa-solid fa-chevron-left"></i>
                </div>
                <div class="lightbox-nav lightbox-next" onclick="changeLightboxImage(1)">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
                <img src="" id="lightbox-img" alt="Fullscreen Image">
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }
});

// Main Render Function
function renderGallery(filterType, isLoadMore = false) {
    const grid = document.getElementById('gallery-grid');
    if (!grid || typeof projects === 'undefined') return;

    let currentURL = location.href.toLowerCase(); 

    // अगर 'Load More' क्लिक नहीं हुआ है, मतलब नया टैब क्लिक हुआ है (सब रिसेट करें)
    if (!isLoadMore) {
        currentFilter = filterType.toLowerCase();
        currentPage = 1;
        grid.innerHTML = ''; 
        currentGalleryImages = []; 

        // सिर्फ वो प्रोजेक्ट्स छांटें जो फिल्टर से मैच करते हैं
        filteredProjects = projects.filter(p => {
            let eventName = (p.eventType || p.event || "").toLowerCase();
            return currentFilter === 'all' || eventName.includes(currentFilter);
        });
    }

    // Pagination Calculation (कौनसे नंबर से कौनसे नंबर तक दिखाना है)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const projectsToRender = filteredProjects.slice(startIndex, endIndex);

    let html = '';

    projectsToRender.forEach((p, index) => {
        let cleanName = (p.eventType || p.event || "").replace(/^[0-9-]+\s*/, '');

        if (currentURL.includes("photography")) {
            currentGalleryImages.push(p.src); 
            let myIndex = currentGalleryImages.length - 1; // Lightbox के लिए सही इंडेक्स

            html += `
            <div class="gallery-item" style="animation: scaleIn 0.5s ease-out forwards; animation-delay: ${index * 0.05}s;" onclick="openLightbox(${myIndex})">
                <img src="${p.src}" loading="lazy" alt="${cleanName}">
                <div class="gallery-overlay"><div class="gallery-text"><h4>${cleanName}</h4></div></div>
            </div>`;
        }
        else if (currentURL.includes("videography")) {
            let videoTag = "";
            
            // --- Multi-Platform Engine with Lazy Loading ---
            // 'loading="lazy"' जोड़ दिया है ताकि बैकग्राउंड में डाटा न खाए
            if(p.where === "instagram") {
                videoTag = `<iframe class="instagram-media" src="${p.src}" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy" allowfullscreen></iframe>`;
            } else if(p.where === "youtube") {
                videoTag = `<iframe class="instagram-media" src="${p.src}" title="${cleanName}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="lazy" allowfullscreen></iframe>`;
            } else {
                videoTag = `<video src="${p.src}" controls preload="none"></video>`;
            }

            html += `
            <div class="video-card video-anim" style="animation-delay: ${index * 0.1}s;">
                <div class="video-wrapper">${videoTag}</div>
                <div class="video-info">
                    <span class="video-tag">${cleanName.toUpperCase()}</span>
                    <h4>${p.name || 'Cinematic Film'}</h4>
                </div>
            </div>`;
        }
    });

    // अगर Load More है तो पुराने ग्रिड के नीचे जोड़ें, वरना पूरा ग्रिड बदलें
    if (isLoadMore) {
        grid.insertAdjacentHTML('beforeend', html);
    } else {
        grid.innerHTML = html;
    }

    // --- Load More Button Logic ---
    let btnContainer = document.getElementById('load-more-container');

    // अगर सारे वीडियो लोड हो गए हैं, तो बटन को छुपा दें
    if (endIndex >= filteredProjects.length) {
        btnContainer.style.display = 'none';
    } else {
        btnContainer.style.display = 'block';
    }
}

// Button Click Function
window.loadMoreProjects = function() {
    currentPage++; // पेज नंबर बढ़ाएं
    renderGallery(currentFilter, true); // true का मतलब है 'Load More' मोड में चलाएं
}

// Tab Click Effect
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active-link'));
        this.classList.add('active-link');
        renderGallery(this.getAttribute('data-filter')); // टैब बदलने पर रीसेट हो जाएगा
    });
});

// Run renderGallery on page load for inner pages
window.addEventListener('load', () => {
    if(document.getElementById('gallery-grid')) {
        renderGallery('all');
    }
});

// Lightbox Functions
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = currentGalleryImages[currentImageIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeLightboxImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
    else if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
    
    const img = document.getElementById('lightbox-img');
    if(img.animate) {
        const fadeOut = img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
        fadeOut.onfinish = () => {
            img.src = currentGalleryImages[currentImageIndex];
            img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' });
        };
    } else {
        img.src = currentGalleryImages[currentImageIndex];
    }
}