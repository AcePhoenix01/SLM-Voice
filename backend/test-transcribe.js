const { SonioxNodeClient } = require("@soniox/node");
const fs = require("fs");
require("dotenv").config();
fs.writeFileSync("empty.webm", "fake video");
const client = new SonioxNodeClient({ api_key: process.env.SONIOX_API_KEY });
client.stt.transcribeFromFile("empty.webm").then(console.log).catch(e => console.error(e.message));
