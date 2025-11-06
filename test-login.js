const https = require('https');

const data = JSON.stringify({
  email: 'admin@amrita.edu',
  password: 'admin123'
});

const options = {
  hostname: 'sms1-f4f3.vercel.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing login to production...\n');

const req = https.request(options, (res) => {
  let body = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:', body);
    try {
      const json = JSON.parse(body);
      console.log('\nParsed Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
