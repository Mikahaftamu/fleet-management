import axios from 'axios';

async function testOpenRouteServiceAPI() {
  const apiKey = '5b3ce3597851110001cf624841e5a7aaf63e4aaf876c285ef0f15e30';
  
  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/json',
      {
        coordinates: [[39.4753, 13.4966], [39.4800, 13.5100]]
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        }
      }
    );
    
    console.log('API call successful!');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('API call failed:', error.message);
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

testOpenRouteServiceAPI()
  .then(success => {
    if (success) {
      console.log('API key is valid and working!');
    } else {
      console.log('Please check your API key and try again.');
    }
  }); 