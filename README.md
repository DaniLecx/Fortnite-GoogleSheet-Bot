# FortniteSheetBot

A NodeJS bot for updating a [Google Sheet](https://docs.google.com/spreadsheets/d/1gVDgnzNyMCafIWa-dBO3mgNUHmHzgA9O5sWbfQy2Yfg/) and sending a Discord notification when Fortnite API gets updated.

Google Sheet API is used to update skins on every sheet.

![Google Sheet](https://i.imgur.com/VFpODAI.gif)

Discord.js is used to send a notification when new skins are added to Google Sheets.

![Discord bot](https://i.imgur.com/wNCDmd2.png)

## Setup

You need add your keys in **secret-keys.json** for the bot to work.

- Discord bot token from [Discord developer portal](https://discordapp.com/developers/applications)<br/>
  *Stored as **DISCORD_TOKEN***

- Discord notification channel id<br/>
  *Stored as **DISCORD_CHANNEL_ID***<br/>
  Instructions on how to get your channel ID [here](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).

- Fortnite API key from [fortniteapi.io](https://fortniteapi.io/)<br/>
  *Stored as **FORTNITEAPI_IO_KEY***
  
- Google Sheet credentials from [Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs)<br/>
  *Stored as **GOOGLE_SHEET_URL_ID***<br/>
Example: docs.google.com/spreadsheets/d/GET_YOUR_SHEET_ID_HERE/
<br />

<br />

Install node dependencies
```javascript
npm install
```
Start the bot
```javascript
npm start
```