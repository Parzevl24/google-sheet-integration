const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Loading google apis
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_email, private_key } = credentials;
const sheets = google.sheets({ version: 'v4' });
const SPREADSHEET_ID = '18VVGu1U5jEizY01-rGTXrHBVTj8PolyiF5csUdKXQmk'; //Google Sheet ID

// Authentication
const auth = new google.auth.JWT(client_email, null, private_key, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
  const { name, email, age } = req.body;

  try {
    // adding data to sheets
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:C', 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, age]],
      },
    });

    res.send('<h1>Data submitted successfully!</h1>');
  } catch (err) {
    console.error('Error appending data:', err);
    res.status(500).send('<h1>Failed to submit data.</h1>');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
