const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
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
    const bookings = database.collection('bookings');
    const availableDates = database.collection('available_dates');

    const { date, name, email, phone, service } = JSON.parse(event.body);

    // Validate required fields
    if (!date || !name || !email || !phone || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Convert string date to Date object
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid date format' }),
      };
    }

    // Check if date is available
    const isAvailable = await availableDates.findOne({ date: bookingDate });
    if (!isAvailable) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Date is not available' }),
      };
    }

    // Check for existing booking
    const existingBooking = await bookings.findOne({ date: bookingDate });
    if (existingBooking) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Date is already booked' }),
      };
    }

    // Create booking
    const booking = {
      date: bookingDate,
      name,
      email,
      phone,
      service,
      createdAt: new Date(),
    };

    await bookings.insertOne(booking);
    
    // Remove date from available dates
    await availableDates.deleteOne({ date: bookingDate });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking created successfully', booking }),
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
