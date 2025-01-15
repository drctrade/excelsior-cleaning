// Simple function to return static dates for testing
exports.handler = async function(event, context) {
  // Sample available dates for the next few days
  const dates = [];
  const today = new Date();
  
  // Add next 5 days as available
  for(let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      title: 'Available',
      start: date.toISOString().split('T')[0],
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      display: 'background'
    });
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({
      message: "Function is working!",
      availableDates: dates
    })
  };
};
