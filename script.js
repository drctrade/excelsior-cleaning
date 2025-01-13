// Language toggle functionality
let currentLang = 'es';

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    const langButton = document.querySelector('.lang-toggle');
    langButton.textContent = currentLang === 'es' ? 'EN' : 'ES';
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    
    // Update all elements with data-es and data-en attributes
    const elements = document.querySelectorAll('[data-es][data-en]');
    elements.forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLang}`);
    });
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-container')) {
            navLinks.classList.remove('active');
        }
    });

    // Close mobile menu when clicking a link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const navHeight = document.querySelector('.navbar').offsetHeight;
        
        window.scrollTo({
            top: target.offsetTop - navHeight,
            behavior: 'smooth'
        });
    });
});

// Testimonials Slider
let slideIndex = 0;
const slides = document.getElementsByClassName("testimonial-slide");

function setupTestimonials() {
    if (slides.length === 0) return;
    
    // Create dots
    const dotsContainer = document.querySelector('.testimonial-dots');
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => showSlide(i);
        dotsContainer.appendChild(dot);
    }
    
    showSlide(0);
    setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }, 5000);
}

function showSlide(n) {
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
        document.getElementsByClassName("dot")[i].classList.remove('active');
    }
    slides[n].classList.add('active');
    document.getElementsByClassName("dot")[n].classList.add('active');
}

// Quote Modal
const modal = document.getElementById("quoteModal");
const quoteButtons = document.querySelectorAll(".cta-button");
const closeBtn = document.querySelector(".close-modal");
const quoteForm = document.getElementById("quoteForm");

quoteButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "block";
    });
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    // For now, we'll just show a success message
    const formData = new FormData(quoteForm);
    console.log("Form submitted:", Object.fromEntries(formData));
    alert(currentLang === 'es' ? 
        "¡Gracias! Nos pondremos en contacto contigo pronto." : 
        "Thank you! We'll contact you soon.");
    modal.style.display = "none";
    quoteForm.reset();
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTestimonials();
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-container')) {
            navLinks.classList.remove('active');
        }
    });

    // Close mobile menu when clicking a link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
});
