const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(cors());

const db = mysql.createConnection({
  host: "db.redhawks.us",
  user: "redhawks_slide",
  password: "VAA0W5lMTgdn9LL",
  database: "redhawks_slide"
});

db.connect((err) => {
  if(err) throw err;
  console.log('Connected to database');
});



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json()); // Add this line to parse JSON body

app.post('/api/save', (req, res) => {
    const sub = req.body.sub;
    const sub2 = req.body.sub2;
    const sqlInsert = "INSERT INTO user_matrix (user_id) VALUES (?)";
    const sqlInsert2 = "INSERT INTO user_matrix (user_name) VALUES (?)";
    db.query(sqlInsert, sub, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving to database.');
        } else {
            res.send('Data saved successfully.');
        }
    });
    db.query(sqlInsert2, sub2, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error saving to database.');
      } else {
          res.send('Data saved successfully.');
      }
  });
});

// Set up Multer storage
const storage = multer.memoryStorage(); // Using memory storage as we'll process the file before saving
const upload = multer({ storage: storage });

// Middleware function to resize image to 16:9 aspect ratio
function resizeTo16x9(req, res, next) {
  if (!req.file) {
    return next();
  }

  // Resize image to 16:9 aspect ratio
  sharp(req.file.buffer)
    .resize({ width: 1920, height: 1080, fit: 'cover' })
    .toBuffer()
    .then(data => {
      req.file.buffer = data;
      next();
    })
    .catch(err => {
      next(err);
    });
}

// Function to count the number of image files in a directory
function countImagesInDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  return files.filter(file => /\.(png|jpe?g|svg)$/i.test(file)).length;
}

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use upload middleware followed by resizing middleware
app.post('/upload', upload.single('image'), resizeTo16x9, (req, res) => {
  // At this point, req.file.buffer contains the resized image

  // Define the directory where the image will be saved
  const saveDir = path.join(__dirname, 'src', 'assets', 'Media', 'slides');

  // Count the number of images in the directory
  const imageCount = countImagesInDirectory(saveDir);

  // Generate a new filename based on the image count
  const newFilename = `slide${imageCount + 1}.png`; // Change the extension if needed

  // Define the full path where the image will be saved
  const savePath = path.join(saveDir, newFilename);

  // Write the image file to disk
  fs.writeFile(savePath, req.file.buffer, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving file.');
    }

    res.send('File uploaded, resized, and saved successfully.');
  });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});