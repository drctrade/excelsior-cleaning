document.addEventListener('DOMContentLoaded', function() {
    // Initialize Admin Calendar
    var calendarEl = document.getElementById('admin-calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        selectable: true,
        selectMirror: true,
        editable: true,
        eventClick: function(info) {
            if (confirm('¿Desea eliminar este bloqueo?')) {
                info.event.remove();
                // Save changes to Netlify
                saveAvailability();
            }
        },
        events: loadBlockedDates()
    });
    calendar.render();

    // Handle Block Dates
    document.getElementById('block-dates-btn').addEventListener('click', function() {
        const startDate = document.getElementById('block-start-date').value;
        const endDate = document.getElementById('block-end-date').value;
        const reason = document.getElementById('block-reason').value;

        if (startDate && endDate) {
            calendar.addEvent({
                title: reason || 'No Disponible',
                start: startDate,
                end: endDate,
                color: '#ff4444'
            });

            // Save changes to Netlify
            saveAvailability();

            // Clear form
            document.getElementById('block-start-date').value = '';
            document.getElementById('block-end-date').value = '';
            document.getElementById('block-reason').value = '';
        }
    });

    // Handle Update Limits
    document.getElementById('update-limits-btn').addEventListener('click', function() {
        const maxBookings = document.getElementById('max-bookings').value;
        // Save to Netlify
        fetch('/.netlify/functions/update-limits', {
            method: 'POST',
            body: JSON.stringify({ maxBookings: maxBookings })
        })
        .then(response => response.json())
        .then(data => {
            alert('Límites actualizados correctamente');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar límites');
        });
    });

    // Load Recent Bookings
    loadRecentBookings();
});

// Function to load blocked dates from Netlify
function loadBlockedDates() {
    // This will be replaced with actual Netlify function call
    return [];
}

// Function to save availability to Netlify
function saveAvailability() {
    const events = calendar.getEvents().map(event => ({
        title: event.title,
        start: event.start,
        end: event.end
    }));

    fetch('/.netlify/functions/save-availability', {
        method: 'POST',
        body: JSON.stringify({ events: events })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Availability saved');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al guardar disponibilidad');
    });
}

// Function to load recent bookings
function loadRecentBookings() {
    const bookingsList = document.getElementById('recent-bookings');
    
    fetch('/.netlify/functions/get-bookings')
    .then(response => response.json())
    .then(bookings => {
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <h4>${booking.service}</h4>
                <p>Fecha: ${new Date(booking.date).toLocaleDateString()}</p>
                <p>Cliente: ${booking.name}</p>
                <p>Estado: ${booking.status}</p>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        bookingsList.innerHTML = '<p>Error al cargar reservas</p>';
    });
}
