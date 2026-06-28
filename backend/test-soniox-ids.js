const { SonioxNodeClient } = require("@soniox/node");
require("dotenv").config();
const client = new SonioxNodeClient({ api_key: process.env.SONIOX_API_KEY });
client.models.list().then(models => {
  models.forEach(m => console.log(m.id, "|", m.name, "|", m.transcription_mode));
}).catch(e => console.error(e.message));
