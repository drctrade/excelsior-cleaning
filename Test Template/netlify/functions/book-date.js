const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    const data = JSON.parse(event.body);
    const { date, name, email, phone, service, message } = data;

    if (!date || !name || !email || !phone || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }

    await client.connect();
    const database = client.db('excelsior');
    const bookings = database.collection('bookings');

    // Check if date is already booked
    const existingBooking = await bookings.findOne({ date: new Date(date) });
    if (existingBooking) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Date already booked' })
      };
    }

    // Create new booking
    await bookings.insertOne({
      date: new Date(date),
      name,
      email,
      phone,
      service,
      message,
      createdAt: new Date(),
      status: 'pending'
    });

    // Send email notification (implement this later)
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking successful' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  } finally {
    await client.close();
  }
};
