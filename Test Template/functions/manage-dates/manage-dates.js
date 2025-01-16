const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { action, dates, adminKey } = JSON.parse(event.body);

        // Verify admin key
        if (adminKey !== process.env.ADMIN_KEY) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        await client.connect();
        const database = client.db('excelsior');
        const datesCollection = database.collection('available_dates');

        switch (action) {
            case 'add':
                // Add new dates
                const datesToAdd = dates.map(date => ({
                    date: date,
                    createdAt: new Date()
                }));
                await datesCollection.insertMany(datesToAdd);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Dates added successfully' })
                };

            case 'remove':
                // Remove dates
                await datesCollection.deleteMany({
                    date: { $in: dates }
                });
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Dates removed successfully' })
                };

            case 'list':
                // List all dates
                const availableDates = await datesCollection.find({}).toArray();
                return {
                    statusCode: 200,
                    body: JSON.stringify({ dates: availableDates })
                };

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.close();
    }
};
