const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');  // Import the cors package
const path = require('path')
const app = express();
const routes = require('./routes/index'); // Ensure this is the correct path
const authRoutes = require('./routes/authRoutes');
const phoneNumberRoutes = require('./routes/phoneNumberRoutes');
// Sample protected route (replace with your routes)
const authenticateJWT = require('./middleware/auth');

app.use(cors());
// app.use(cors({
//   origin: 'https://www.worldwide-home.com'  // Only allow this origin
// }));
app.use(express.json());
app.use(routes); // This is where the error is likely happening
app.use('/api/phone-numbers', phoneNumberRoutes);
// Use the authentication routes
app.use('/api/auth', authRoutes);
app.get('/admin', authenticateJWT(['admin']), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

app.use('/teliance-web', express.static(path.join(__dirname, '../teliance-web/build')))
app.get('/teliance-web/*', (req, res) => res.sendFile(path.join(__dirname, '../teliance-web/build', 'index.html')))
// Load SSL certificate and key
const options = {
  key: fs.readFileSync('/root/telianceDB/teliance.key'),  // Replace with the actual path to your private key
  cert: fs.readFileSync('/root/telianceDB/teliance_fullchain.crt'),  // Replace with the actual path to your certificate
  ca: fs.readFileSync('/root/telianceDB/teliance.pem')  // Add the CA file (pem), if it's a separate file
};

// Set the port for HTTPS (typically 443)
const HTTPS_PORT = process.env.HTTPS_PORT || 443;


// Create an HTTPS server
https.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`Server is running securely on https://localhost:${HTTPS_PORT}`);
});


// const HTTP_PORT = process.env.PORT || 3000;

// // app.listen(PORT, '0.0.0.0', () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });


// http.createServer((req, res) => {
//   res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
//   res.end();
// }).listen(HTTP_PORT, '0.0.0.0', () => {
//   console.log(`HTTP Server running, redirecting all traffic to https://localhost:${HTTPS_PORT}`);
// });


