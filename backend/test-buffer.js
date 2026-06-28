const { SonioxNodeClient } = require("@soniox/node");
const fs = require("fs");
require("dotenv").config();
const client = new SonioxNodeClient({ api_key: process.env.SONIOX_API_KEY });
// we will just pass a buffer of 1 byte
client.stt.transcribeFromFile(Buffer.from([0])).then(console.log).catch(e => console.error(e.message));
