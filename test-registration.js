const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'CUSTOMER',
      location: 'Test Location'
    });
    
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.log('Registration failed:', error.response?.data || error.message);
  }
}

testRegistration();