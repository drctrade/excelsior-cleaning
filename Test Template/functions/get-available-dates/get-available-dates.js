const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async function(event, context) {
    try {
        await client.connect();
        const database = client.db('excelsior');
        const dates = database.collection('available_dates');

        // Get all available dates
        const availableDates = await dates.find({
            date: { 
                $gte: new Date().toISOString().split('T')[0] // Only future dates
            }
        }).toArray();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                availableDates: availableDates.map(d => d.date)
            })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch available dates' })
        };
    } finally {
        await client.close();
    }
};
