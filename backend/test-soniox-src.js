const { SonioxNodeClient } = require("@soniox/node");
const client = new SonioxNodeClient({ api_key: "test" });
console.log(client.stt.transcribeFromFile.toString());
console.log(client.files.uploadFile.toString());
