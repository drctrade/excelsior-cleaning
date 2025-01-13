// Language Toggle Functionality
let currentLanguage = 'es';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    const langButton = document.querySelector('.lang-toggle');
    langButton.textContent = currentLanguage === 'es' ? 'EN' : 'ES';
    updateContent();
}

function updateContent() {
    const elements = document.querySelectorAll('[data-es][data-en]');
    elements.forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.pp-toggle-btn');
    const navMenu = document.querySelector('.pp-navbar-menu');

    toggleBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.pp-navbar-wrapper')) {
            navMenu.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu after clicking
                navMenu.classList.remove('active');
            }
        });
    });

    // Quote Modal Functionality
    const quoteButtons = document.querySelectorAll('.quote-btn');
    const quoteModal = document.getElementById('quoteModal');

    quoteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            quoteModal.style.display = 'block';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === quoteModal) {
            quoteModal.style.display = 'none';
        }
    });
});
