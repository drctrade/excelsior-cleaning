const { MongoClient } = require('mongodb');

// Initialize MongoDB client
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('excelsior_cleaning');
    const availableDates = database.collection('available_dates');

    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get available dates for the next 3 months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const dates = await availableDates
      .find({
        date: {
          $gte: today,
          $lte: endDate
        },
        available: true
      })
      .toArray();

    // Format dates for FullCalendar
    const events = dates.map(date => ({
      title: 'Available',
      start: date.date,
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      display: 'background'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    await client.close();
  }
};
