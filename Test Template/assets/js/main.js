document.addEventListener('DOMContentLoaded', function() {
    // Language Switcher
    const languageBtn = document.querySelector('.language-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', function() {
            const currentLang = document.documentElement.getAttribute('lang') || 'es';
            const newLang = currentLang === 'es' ? 'en' : 'es';
            document.documentElement.setAttribute('lang', newLang);
            
            // Update all elements with data-es and data-en attributes
            document.querySelectorAll('[data-es][data-en]').forEach(element => {
                element.textContent = element.getAttribute(`data-${newLang}`);
            });

            // Update button text
            this.textContent = newLang === 'es' ? 'EN' : 'ES';

            // Update calendar locale if it exists
            if (window.calendar) {
                window.calendar.setOption('locale', newLang);
            }
        });
    }

    // Initialize Calendar
    const calendarEl = document.getElementById('booking-calendar');
    if (calendarEl) {
        window.calendar = new FullCalendar.Calendar(calendarEl, {
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
        window.calendar.render();
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
                if (window.calendar) {
                    window.calendar.unselect();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar la solicitud. Por favor, intente nuevamente.');
            });
        });
    }
});
