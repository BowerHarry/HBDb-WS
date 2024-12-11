const axios = require('axios');

async function testLogin() {
  try {

    var params = new URLSearchParams();
    params.append('username', 'testLogin');
    // params.append('password', 'REMOVED_PASSWORD_HASH');
    params.append('password', 'incorrect password');

    const response = await axios.post('http://localhost:8080/login', params,
      {headers:{'Content-Type': 'application/x-www-form-urlencoded'}}
    )


    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error:', error.response.status, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin(); 