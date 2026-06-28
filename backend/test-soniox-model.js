const { SonioxNodeClient } = require("@soniox/node");
require("dotenv").config();
const client = new SonioxNodeClient({ api_key: process.env.SONIOX_API_KEY });

// List available models
client.models.list().then(models => {
  console.log("Available models:");
  console.log(JSON.stringify(models, null, 2));
}).catch(e => console.error("Models error:", e.message));
