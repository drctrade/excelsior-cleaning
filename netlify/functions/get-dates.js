const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  const MONGODB_URI = process.env.MONGODB_URI;
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const database = client.db('excelsior');
    const dates = await database.collection('available_dates').find({}).toArray();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(dates)
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
