# FortniteSheetBot

A NodeJS bot for updating a [Google Sheet](https://docs.google.com/spreadsheets/d/1gVDgnzNyMCafIWa-dBO3mgNUHmHzgA9O5sWbfQy2Yfg/) and sending a Discord notification when Fortnite API gets updated.

Google Sheet API is used to update skins on every sheet.

![Google Sheet](https://i.imgur.com/VFpODAI.gif)

Discord.js is used to send a notification when new skins are added to Google Sheets.

![Discord bot](https://i.imgur.com/wNCDmd2.png)

## Setup

You need three tokens for the bot to work.

- Fortnite API token "x-api-key" from [fortnite-api.com](https://fortnite-api.com/profile)<br/>
  *Stored in **fortniteAPIKey.json** by default.*

- Discord bot token "discord-token" from [Discord developer portal](https://discordapp.com/developers/applications)<br/>
  *Stored in **discordToken.json** by default.*
  
- Google Sheet credentials from [Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs)

<br />

You need to set variables in **FortniteAPI-to-GoogleSheet.js**

- Set **SHEET_URL_ID** with your Google Sheet ID. <br/>
Example: *docs.google.com/spreadsheets/d/**GET_YOUR_SHEET_ID_HERE**/edit#gid=0*

- Set **DISCORD_CHANNEL_ID** with your Discord channel ID. <br/>
Instructions on how to get your channel ID [here](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-).

<br />

Install node dependencies
```javascript
npm install
```
Start the bot
```javascript
npm start
```