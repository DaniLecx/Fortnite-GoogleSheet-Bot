var request = require("request");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

const API_URL = 'https://fortnite-api.com/cosmetics/br';
const API_KEY_PATH = 'apiKey.json';

const options = {
  url: API_URL,
  headers: JSON.parse(fs.readFileSync(API_KEY_PATH, 'utf8'))
};

// Hardcoded Google Sheet names
const SKIN_CATEGORY_ARRAY = ['outfit', 'emote', 'backpack', 'glider', 'pickaxe', 'contrail', 'emoji', 'wrap', 'loadingscreen', 'spray', 'banner', 'music', 'pet', 'toy'];
const SHEET_PAGES = ['Skins!A3', 'Emotes!A3', 'Backpacks!A3', 'Gliders!A3', 'Pickaxes!A3', 'Trails!A3', 'Emojis!A3', 'Wraps!A3', 'Loading Screens!A3', 'Sprays!A3', 'Banner!A3', 'Music!A3', 'Pet!A3', 'Toy!A3'];

var skinsArray = [];
var skinCount = 0;
var seconds = 60;

// Execute function every X seconds
getSkinArrayFromAPI(API_URL, LoadCredentials)
setInterval(function() {getSkinArrayFromAPI(API_URL, LoadCredentials)}, seconds * 1000);

function getSkinArrayFromAPI(url, callback) {

  // GET json data from API
  request(options, (err, res, body) => {
    if (err) { return console.log(err); }

    if (res.statusCode == 200) {

      var jsonData = JSON.parse(res.body).data;

      // If API got updated
      if (jsonData.length > skinCount) {
        console.log("Fortnite API got updated with ", jsonData.length - skinCount," new skins !");
        skinCount = jsonData.length;
        skinsArray = [];

        // Fill each category array with API data
        SKIN_CATEGORY_ARRAY.forEach(category => {
          skinsArray.push(jsonData.filter(o => o.type.includes(category.toLowerCase())));
        })

        // Callback for update with Google Sheet API
        callback(callback);
      }
      else {
        console.log("No Fortnite API update !");
      }

    }
    else {
      console.log("Error " + res.statusCode)
    }
  });
}

// Load client secrets from a local file.
function LoadCredentials() {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), appendSkins);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function appendSkins(oAuth) {
  const sheets = google.sheets({ version: 'v4', oAuth });

  // For each skin category
  SKIN_CATEGORY_ARRAY.forEach((skinCategory, i) => {
    var skinsInfo = [];
    var sheetRange = SHEET_PAGES[i];

    // Generate data to insert in Google Sheets
    skinsArray[i].forEach(skin => {
      skinsInfo.push(new Array('=IMAGE("' + skin.images.smallIcon.url + '")', skin.id, skin.id.length, skin.name, skin.description));
    })

    var request = {
      // The ID of the spreadsheet to update, shown in URL
      spreadsheetId: '1UFOogvLXZjPKRLL3_dXmBkg8iftbwV3vfl0ZcbFzfpI',
      range: sheetRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        "values": skinsInfo
      },
      auth: oAuth,
    };

    // Send update request with google sheet API
    sheets.spreadsheets.values.update(request, function (err, response) {
      if (err) {
        console.error(err);
        return;
      }
      else {
        console.log('       ' + sheetRange + ' sheet updated succesfully !');
      }

    });
  })
}