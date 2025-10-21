const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Probando login con admin@sistema.com...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sistema.com',
        password: 'admin123'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('Token:', data.data?.token);
    } else {
      console.log('❌ Login falló');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
