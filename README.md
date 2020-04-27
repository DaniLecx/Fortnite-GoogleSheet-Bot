# FortniteSheetBot

A NodeJS bot for updating a [Google Sheet](https://docs.google.com/spreadsheets/d/1gVDgnzNyMCafIWa-dBO3mgNUHmHzgA9O5sWbfQy2Yfg/) and sending a Discord notification when Fortnite API gets updated.

Google Sheet API is used to update skins on every sheet.

![Google Sheet](https://i.imgur.com/VFpODAI.gif)

Discord.js is used to send a notification when new skins are added to Google Sheets.

![Discord bot](https://i.imgur.com/wNCDmd2.png)

## Setup

You need three tokens for the bot to work.

- Fortnite API token "x-api-key" from [fortnite-api.com](https://fortnite-api.com/profile)

  *Stored in **fortniteAPIKey.json** by default.*
- Discord bot token "discord-token" from [Discord developer portal](https://discordapp.com/developers/applications)

  *Stored in **discordToken.json** by default.*
- Google Sheet credentials from [Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs)

<br />

Set **SHEET_URL_ID** with your Sheet ID. <br/>
Example: *docs.google.com/spreadsheets/d/**GET_YOUR_SHEET_ID_HERE**/edit#gid=0*

<br />

Install node dependencies
```javascript
npm install
```