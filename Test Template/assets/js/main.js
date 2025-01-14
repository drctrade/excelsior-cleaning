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
        });
    }

    // Initialize FullCalendar
    var calendarEl = document.getElementById('booking-calendar');
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            locale: 'es', // Default to Spanish
            selectable: true,
            selectMirror: true,
            select: function(info) {
                const dateInput = document.getElementById('selected-date');
                if (dateInput) {
                    const formattedDate = info.start.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    dateInput.value = formattedDate;
                }
            },
            selectConstraint: {
                start: new Date().toISOString().split('T')[0] // Only allow selecting current or future dates
            },
            validRange: {
                start: new Date().toISOString().split('T')[0] // Disable past dates
            }
        });
        calendar.render();
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
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar la solicitud. Por favor, intente nuevamente.');
            });
        });
    }
});
