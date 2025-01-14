document.addEventListener('DOMContentLoaded', function() {
    // Initialize Calendar
    const calendarEl = document.getElementById('booking-calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            locale: 'es',
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

                    const options = { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    };
                    dateInput.value = date.toLocaleDateString('es-ES', options);
                }
            },
            validRange: function(nowDate) {
                return {
                    start: nowDate
                };
            },
            eventSources: [
                {
                    url: '/.netlify/functions/get-available-dates',
                    method: 'GET',
                    failure: function() {
                        console.error('Error loading available dates');
                    }
                }
            ],
            eventClick: function(info) {
                const dateInput = document.getElementById('selected-date');
                if (dateInput) {
                    const date = new Date(info.event.start);
                    const options = { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    };
                    dateInput.value = date.toLocaleDateString('es-ES', options);
                }
            }
        });
        calendar.render();

        // Store calendar instance globally for language switching
        window.bookingCalendar = calendar;
    }

    // Form submission handling
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString()
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(() => {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success mt-3';
                successMessage.innerHTML = `
                    <h4>¡Gracias por su solicitud!</h4>
                    <p>Hemos recibido su solicitud de servicio. Nos pondremos en contacto con usted pronto para confirmar los detalles.</p>
                    <p>Si tiene alguna pregunta, no dude en contactarnos:</p>
                    <ul>
                        <li>WhatsApp: +57 312-345-6789</li>
                        <li>Email: info@excelsiorclean.com</li>
                    </ul>
                `;
                bookingForm.insertAdjacentElement('beforebegin', successMessage);
                
                // Reset form and calendar selection
                bookingForm.reset();
                if (window.bookingCalendar) {
                    window.bookingCalendar.unselect();
                }

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });

                // Remove success message after 10 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 10000);
            })
            .catch((error) => {
                console.error('Error:', error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger mt-3';
                errorMessage.textContent = 'Hubo un error al enviar la solicitud. Por favor, intente nuevamente.';
                bookingForm.insertAdjacentElement('beforebegin', errorMessage);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            });
        });
    }
});
