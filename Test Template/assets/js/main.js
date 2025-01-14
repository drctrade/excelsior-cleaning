document.addEventListener('DOMContentLoaded', function() {
    // Language Switcher
    const languageBtn = document.querySelector('.language-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', function() {
            // Get current language
            const currentLang = document.documentElement.getAttribute('lang') || 'es';
            const newLang = currentLang === 'es' ? 'en' : 'es';
            
            // Update HTML lang attribute
            document.documentElement.setAttribute('lang', newLang);
            
            // Update all elements with data-es and data-en attributes
            document.querySelectorAll('[data-es][data-en]').forEach(element => {
                const newText = element.getAttribute(`data-${newLang}`);
                if (newText) {
                    if (element.tagName.toLowerCase() === 'input' && element.type === 'submit') {
                        element.value = newText;
                    } else if (element.tagName.toLowerCase() === 'input' && element.type === 'placeholder') {
                        element.placeholder = newText;
                    } else {
                        element.textContent = newText;
                    }
                }
            });

            // Update button text
            this.textContent = newLang === 'es' ? 'EN' : 'ES';

            // Update calendar locale if it exists
            if (window.bookingCalendar) {
                window.bookingCalendar.setOption('locale', newLang);
            }

            // Save language preference
            localStorage.setItem('preferredLanguage', newLang);
        });

        // Set initial language from localStorage
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
            languageBtn.click();
        }
    }

    // Mobile Menu Toggle
    const toggleBtn = document.querySelector('.pp-toggle-btn');
    const navbarMenu = document.querySelector('.pp-navbar-menu');
    
    if (toggleBtn && navbarMenu) {
        toggleBtn.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    toggleBtn.classList.remove('active');
                }
            }
        });
    });

    // Initialize Swiper for testimonials if exists
    const testimonialsSwiper = document.querySelector('.testimonials-slider');
    if (testimonialsSwiper) {
        new Swiper(testimonialsSwiper, {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
    }

    // Initialize Calendar
    const calendarEl = document.getElementById('booking-calendar');
    if (calendarEl) {
        window.bookingCalendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            locale: document.documentElement.getAttribute('lang') || 'es',
            selectable: true,
            selectMirror: true,
            select: function(info) {
                const dateInput = document.getElementById('selected-date');
                if (dateInput) {
                    const date = new Date(info.start);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (date < today) {
                        alert('Por favor seleccione una fecha futura.');
                        return;
                    }

                    const locale = document.documentElement.getAttribute('lang') || 'es';
                    const options = { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    };
                    dateInput.value = date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
                }
            },
            validRange: function(nowDate) {
                return {
                    start: nowDate
                };
            }
        });
        window.bookingCalendar.render();
    }

    // Form submission handling
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);
            
            // Submit form to Netlify
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            })
            .then(() => {
                alert('¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.');
                bookingForm.reset();
                if (window.bookingCalendar) {
                    window.bookingCalendar.unselect();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar la solicitud. Por favor, intente nuevamente.');
            });
        });
    }
});
