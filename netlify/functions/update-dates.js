const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  const client = new MongoClient(MONGODB_URI);

  try {
    const { dates } = JSON.parse(event.body);
    
    await client.connect();
    const database = client.db('excelsior');
    const collection = database.collection('available_dates');
    
    // Clear existing dates and insert new ones
    await collection.deleteMany({});
    if (dates && dates.length > 0) {
      await collection.insertMany(dates.map(date => ({ date })));
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Dates updated successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.close();
  }
};
