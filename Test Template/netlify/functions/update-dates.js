const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db('excelsior');
    const dates = database.collection('available_dates');

    const { dates: newDates } = JSON.parse(event.body);

    // Validate dates
    if (!Array.isArray(newDates)) {
      throw new Error('Dates must be provided as an array');
    }

    // Convert string dates to Date objects and validate format
    const validatedDates = newDates.map(dateStr => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      return date;
    });

    // Check for overlapping bookings
    const existingBookings = await database.collection('bookings').find({
      date: { $in: validatedDates }
    }).toArray();

    if (existingBookings.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'Some dates are already booked',
          conflictingDates: existingBookings.map(booking => booking.date)
        })
      };
    }

    // Clear existing available dates and insert new ones
    await dates.deleteMany({});
    if (validatedDates.length > 0) {
      await dates.insertMany(validatedDates.map(date => ({ date })));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Dates updated successfully' }),
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
