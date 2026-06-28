const { SonioxNodeClient } = require("@soniox/node");
const fs = require("fs");
require("dotenv").config();

// We must create a valid audio file to test properly, or else we get HTTP 400.
// For the sake of testing if the SDK throws a Type Error or something, we'll just pass a valid stream
const client = new SonioxNodeClient({ api_key: process.env.SONIOX_API_KEY });
client.stt.transcribeFromFile(fs.createReadStream("dummy.wav"), { wait: true, filename: "dummy.wav" })
  .then(console.log)
  .catch(e => console.error("EXPECTED HTTP 400:", e.message));
