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

// Function to handle bulk month selection
async function handleMonthSelection(e) {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dates = [];

    if (e.target.checked) {
        // Select all days in current month
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }
    }

    try {
        const response = await fetch('/.netlify/functions/update-dates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dates: dates })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
                // Handle conflicting dates
                alert('Some dates are already booked: ' + errorData.conflictingDates.join(', '));
                e.target.checked = false;
                return;
            }
            throw new Error(errorData.message || 'Failed to update dates');
        }

        // Refresh calendar display
        await loadAvailableDates();
        calendar.refetchEvents();
        
        // Show success message
        alert('Fechas actualizadas exitosamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar las fechas: ' + error.message);
        e.target.checked = false;
    }
}

// Function to load available dates
async function loadAvailableDates() {
    try {
        const response = await fetch('/.netlify/functions/get-dates');
        if (!response.ok) {
            throw new Error('Failed to load dates');
        }
        
        const data = await response.json();
        
        // Clear existing events
        calendar.removeAllEvents();
        
        // Add available dates
        data.available.forEach(date => {
            calendar.addEvent({
                start: date,
                allDay: true,
                className: 'available-date'
            });
        });
        
        // Add booked dates
        data.booked.forEach(date => {
            calendar.addEvent({
                start: date,
                allDay: true,
                className: 'booked-date',
                editable: false
            });
        });
    } catch (error) {
        console.error('Error loading dates:', error);
        alert('Error al cargar las fechas');
    }
}

// Initialize calendar and event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Admin Calendar
    var calendarEl = document.getElementById('admin-calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        selectable: true,
        selectMirror: true,
        editable: true,
        eventClick: async function(info) {
            if (info.event.classNames.includes('booked-date')) {
                alert('Esta fecha ya está reservada');
                return;
            }
            
            if (confirm('¿Desea eliminar esta fecha?')) {
                try {
                    const response = await fetch('/.netlify/functions/update-dates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            dates: calendar.getEvents()
                                .filter(e => e !== info.event && e.classNames.includes('available-date'))
                                .map(e => e.start.toISOString().split('T')[0])
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update dates');
                    }

                    info.event.remove();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al eliminar la fecha');
                }
            }
        },
        eventClassNames: function(arg) {
            return arg.event.classNames;
        }
    });
    
    calendar.render();
    
    // Load initial dates
    await loadAvailableDates();
    
    // Add event listener for select all month checkbox
    document.getElementById('selectAllMonth').addEventListener('change', handleMonthSelection);

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

    // Initialize calendar with flatpickr
    function initializeCalendar() {
        calendar = flatpickr("#calendar", {
            mode: "multiple",
            dateFormat: "Y-m-d",
            enable: [],
            inline: true,
            monthSelectorType: "static",
            prevArrow: "<span class='fas fa-chevron-left'></span>",
            nextArrow: "<span class='fas fa-chevron-right'></span>",
            onChange: function(selectedDates, dateStr, instance) {
                updateSelectedDates(selectedDates);
            }
        });

        // Add select all month functionality
        document.getElementById('selectAllMonth').addEventListener('change', function(e) {
            const currentMonth = calendar.currentMonth;
            const currentYear = calendar.currentYear;
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            if (e.target.checked) {
                // Select all days in current month
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentYear, currentMonth, day);
                    if (!calendar.selectedDates.some(d => d.toDateString() === date.toDateString())) {
                        calendar.selectedDates.push(date);
                    }
                }
            } else {
                // Deselect all days in current month
                calendar.selectedDates = calendar.selectedDates.filter(date => {
                    return date.getMonth() !== currentMonth || date.getFullYear() !== currentYear;
                });
            }
            
            calendar.redraw();
            updateSelectedDates(calendar.selectedDates);
        });

        // Update select all checkbox when month changes
        calendar.config.onMonthChange = function(selectedDates, dateStr, instance) {
            updateSelectAllCheckbox();
        };
    }

    // Update select all checkbox based on current month selection
    function updateSelectAllCheckbox() {
        const currentMonth = calendar.currentMonth;
        const currentYear = calendar.currentYear;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        let allSelected = true;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            if (!calendar.selectedDates.some(d => d.toDateString() === date.toDateString())) {
                allSelected = false;
                break;
            }
        }
        
        document.getElementById('selectAllMonth').checked = allSelected;
    }

    // Add mobile-friendly improvements
    function addMobileImprovements() {
        const calendarElement = document.querySelector('.flatpickr-calendar');
        if (calendarElement) {
            calendarElement.style.maxWidth = '100%';
            calendarElement.style.fontSize = '16px'; // Prevent zoom on mobile
            
            // Make day cells larger on mobile
            const dayCells = calendarElement.querySelectorAll('.flatpickr-day');
            dayCells.forEach(cell => {
                cell.style.minHeight = '44px'; // Minimum touch target size
                cell.style.lineHeight = '44px';
            });
        }
    }

    initializeCalendar();
    addMobileImprovements();
    
    // Reinitialize mobile improvements when window resizes
    window.addEventListener('resize', addMobileImprovements);
});

// Function to save availability to Netlify
async function saveAvailability() {
    const events = calendar.getEvents();
    const dates = events.map(event => event.start.toISOString().split('T')[0]);

    try {
        const response = await fetch('/.netlify/functions/update-dates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dates: dates })
        });

        if (!response.ok) {
            throw new Error('Failed to save dates');
        }

        // Show success message
        alert('Fechas guardadas exitosamente');
    } catch (error) {
        console.error('Error saving dates:', error);
        alert('Error al guardar las fechas');
    }
}

// Function to load blocked dates from Netlify
async function loadBlockedDates() {
    try {
        const response = await fetch('/.netlify/functions/get-dates');
        const data = await response.json();
        
        return data.dates.map(date => ({
            start: date,
            allDay: true
        }));
    } catch (error) {
        console.error('Error loading dates:', error);
        return [];
    }
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
