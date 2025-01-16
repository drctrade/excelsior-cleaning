// Simple in-memory storage for available dates
let availableDates = [];

exports.handler = async function(event, context) {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { action, dates } = JSON.parse(event.body);

        switch (action) {
            case 'add':
                console.log('Adding dates:', dates);
                // Add new dates
                dates.forEach(date => {
                    if (!availableDates.includes(date)) {
                        availableDates.push(date);
                    }
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        message: 'Dates added successfully',
                        dates: availableDates
                    })
                };

            case 'remove':
                console.log('Removing dates:', dates);
                // Remove dates
                availableDates = availableDates.filter(d => !dates.includes(d));
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        message: 'Dates removed successfully',
                        dates: availableDates
                    })
                };

            case 'list':
                console.log('Listing dates');
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        dates: availableDates.map(date => ({ date }))
                    })
                };

            default:
                return {
                    statusCode: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
