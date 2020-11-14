var request = require("request");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const Discord = require('discord.js');
const client = new Discord.Client();


// Secret, tokens and properties
const SECRET_KEYS_PATH = 'secret-keys.json'
const SECRET_KEYS = JSON.parse(fs.readFileSync(SECRET_KEYS_PATH, 'utf8'));

const SHEET_TOKEN_PATH = 'token.json';
const APP_PROPERTIES_PATH = 'appProperties.json';
const FORTNITE_API_URL = 'https://fortniteapi.io/v1/items/list?lang=en';
var SECONDS_BETWEEN_UPDATES = 100;

// Prepare request for API connection
const options = {
  url: FORTNITE_API_URL,
  headers: {
    "Authorization": SECRET_KEYS['FORTNITEAPI_IO_KEY']
  }
};

// Hardcoded Google Sheet names
const SKIN_CATEGORY_ARRAY = ['outfit', 'emote', 'backpack', 'glider', 'pickaxe', 'contrail', 'emoji', 'wrap', 'loadingscreen', 'spray', 'bannertoken', 'music', 'pet', 'toy'];
const SHEET_PAGES = ['Skins!A3', 'Emotes!A3', 'Backpacks!A3', 'Gliders!A3', 'Pickaxes!A3', 'Trails!A3', 'Emojis!A3', 'Wraps!A3', 'Loading Screens!A3', 'Sprays!A3', 'Banner!A3', 'Music!A3', 'Pet!A3', 'Toy!A3'];

var skinsArray = [];
var skinCount = 0;

// Check if properties exist and get skin count
if(fs.existsSync(APP_PROPERTIES_PATH) && JSON.parse(fs.readFileSync(APP_PROPERTIES_PATH, 'utf8'))['skin-count'] != undefined)
{
  var jsonSkinCount = JSON.parse(fs.readFileSync(APP_PROPERTIES_PATH, 'utf8'))['skin-count'];
  if(jsonSkinCount != undefined && isNaN(jsonSkinCount) == false)
    skinCount = jsonSkinCount;
}

var botChannel;

// Wait for discord bot to be ready
client.on('ready', () => {
  botChannel = client.channels.cache.get(SECRET_KEYS['DISCORD_CHANNEL_ID']);
  getSkinArrayFromAPI(FORTNITE_API_URL, LoadCredentials)
  // Execute function every X seconds
  setInterval(() => getSkinArrayFromAPI(FORTNITE_API_URL, LoadCredentials), SECONDS_BETWEEN_UPDATES * 1000);
});

// Login discord bot
client.login(SECRET_KEYS['DISCORD_TOKEN']);

// Get all skins from fortniteapi.io/
function getSkinArrayFromAPI(url, callback) {

  // GET json data from API
  request(options, (err, res, body) => {
    if (err) { return console.log(err); }

    if (res.statusCode == 200) {

      var jsonData = JSON.parse(body);

      // If API got updated
      if (jsonData.itemsCount > skinCount) {
        var addedSkins = (jsonData.itemsCount - skinCount).toString();
        console.log("Fortnite API got updated with " + addedSkins + " new skins !");
        // Ping role on discord
        var url = "https://docs.google.com/spreadsheets/d/" + SECRET_KEYS['GOOGLE_SHEET_URL_ID'];
        botChannel.send("Google Sheet updated with " + addedSkins + " new skins ! \nMise à jour de " + addedSkins + " skins sur le Google Sheet !\n<" + url + ">\n<@&704022772040335370>");
        // Save last skin count in file
        var properties = { 'skin-count': jsonData.itemsCount}
        var jsonString = JSON.stringify(properties, null, 4);
        fs.writeFileSync(APP_PROPERTIES_PATH, jsonString, (err) => {console.log(err)});

        skinsArray = [];

        // Fill each category array with API data
        SKIN_CATEGORY_ARRAY.forEach(category => {
          const sortedSkinArray = Object.keys(jsonData.items[category]).map(function (key) {
            return jsonData.items[category][key];
          })
          .sort(function (skinA, skinB) {
            return (skinA.id < skinB.id) ? -1 : (skinA.id > skinB.id) ? 1 : 0;
          });

          skinsArray.push(sortedSkinArray);
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
  fs.readFile(SHEET_TOKEN_PATH, (err, token) => {
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
    scope: 'https://www.googleapis.com/auth/spreadsheets',
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
      fs.writeFile(SHEET_TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', SHEET_TOKEN_PATH);
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
      var imageURL = "", skinID = "", skinIDLength = "", skinName = "", skinDescription = "";
      if(skin)
      {
        if(skin.images && skin.images.icon)
          imageURL = skin.images.icon;
        if(skin.id)
        {
          skinID = skin.id;
          skinIDLength = skinID.length;
        }
        if(skin.name)
          skinName = skin.name;
        if(skin.description)
          skinDescription = skin.description;
      }
        
      skinsInfo.push(new Array('=IMAGE("' + imageURL + '")', skinID, skinIDLength, skinName, skinDescription));
    })

    var request = {
      // The ID of the spreadsheet to update, shown in URL
      spreadsheetId: SECRET_KEYS['GOOGLE_SHEET_URL_ID'],
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