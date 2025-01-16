const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
        const { action, dates, adminKey } = JSON.parse(event.body);

        // Verify admin key
        if (adminKey !== process.env.ADMIN_KEY) {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        await client.connect();
        console.log('Connected to MongoDB');
        
        const database = client.db('excelsior');
        const datesCollection = database.collection('available_dates');

        switch (action) {
            case 'add':
                console.log('Adding dates:', dates);
                // Add new dates
                const datesToAdd = dates.map(date => ({
                    date: date,
                    createdAt: new Date()
                }));
                await datesCollection.insertMany(datesToAdd);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ message: 'Dates added successfully' })
                };

            case 'remove':
                console.log('Removing dates:', dates);
                // Remove dates
                await datesCollection.deleteMany({
                    date: { $in: dates }
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ message: 'Dates removed successfully' })
                };

            case 'list':
                console.log('Listing dates');
                // List all dates
                const availableDates = await datesCollection.find({}).toArray();
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ dates: availableDates })
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
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    } finally {
        await client.close();
    }
};
