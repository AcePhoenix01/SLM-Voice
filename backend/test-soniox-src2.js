const { SonioxNodeClient } = require("@soniox/node");
const client = new SonioxNodeClient({ api_key: "test" });
console.log(client.stt.transcribe.toString());
