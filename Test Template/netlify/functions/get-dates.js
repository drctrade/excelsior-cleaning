const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db('excelsior');
    const dates = database.collection('available_dates');

    // Get all available dates
    const availableDates = await dates.find({}).toArray();

    // Get all booked dates
    const bookings = await database.collection('bookings').find({}).toArray();

    // Format dates for response
    const formattedDates = availableDates.map(d => d.date.toISOString().split('T')[0]);
    const bookedDates = bookings.map(b => b.date.toISOString().split('T')[0]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        available: formattedDates,
        booked: bookedDates
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  } finally {
    await client.close();
  }
};
