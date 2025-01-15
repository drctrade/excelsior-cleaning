document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('booking-calendar');
    
    if (!calendarEl) return;

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        selectMirror: true,
        locale: document.documentElement.lang || 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        select: function(info) {
            document.getElementById('selected-date').value = info.startStr;
        },
        dateClick: function(info) {
            document.getElementById('selected-date').value = info.dateStr;
        }
    });

    calendar.render();

    // Fetch available dates from Netlify function
    fetch('/.netlify/functions/get-available-dates')
        .then(response => response.json())
        .then(data => {
            // Add available dates to calendar
            if (data && data.availableDates) {
                data.availableDates.forEach(date => {
                    calendar.addEvent({
                        start: date,
                        display: 'background',
                        backgroundColor: 'rgba(40, 167, 69, 0.2)'
                    });
                });
            }
        })
        .catch(error => console.error('Error fetching available dates:', error));

    // Update calendar locale when language changes
    document.addEventListener('languageChanged', function(e) {
        calendar.setOption('locale', e.detail.language);
    });

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
