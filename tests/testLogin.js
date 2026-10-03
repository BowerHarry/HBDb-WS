// Manual check against a locally running server: expects a 401.
async function testLogin() {
  try {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'testLogin', password: 'incorrect password'})
    });

    console.log('Response:', response.status, await response.text());
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testLogin();
