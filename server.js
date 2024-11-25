const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');  // Import the cors package
const path = require('path')
const app = express();
const routes = require('./routes/index'); // Ensure this is the correct path
//const authRoutes = require('./routes/authRoutes');
//const phoneNumberRoutes = require('./routes/phoneNumberRoutes');
// Sample protected route (replace with your routes)
const authenticateJWT = require('./middleware/auth');
// Folder containing files
const folderPath = path.join(__dirname, 'box_files');

app.use(cors());
// app.use(cors({
//   origin: 'https://www.worldwide-home.com'  // Only allow this origin
// }));
app.use(express.json());
app.use(routes); // This is where the error is likely happening
//app.use('/api/phone-numbers', phoneNumberRoutes);
// Use the authentication routes
//app.use('/api/auth', authRoutes);
app.get('/admin', authenticateJWT(['admin']), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});
// GET endpoint to list files containing "date" in the filename
app.get('/files', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Query parameter "date" is required' });
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading the directory', err });
    }

    // Filter files that contain the date string
    const matchingFiles = files.filter(file => file.includes(date)).map(file => `https://70.42.223.135/file?filename=${file}`)
    res.json({ files: matchingFiles });
  });
});
// GET endpoint to return the file file
app.get('/file', (req, res) => {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: 'Query parameter "filename" is required' });
  }

  const filePath = path.join(folderPath, filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send the file
    res.sendFile(filePath);
  });
});

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

