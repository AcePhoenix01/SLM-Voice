const { SonioxNodeClient } = require("@soniox/node");
const client = new SonioxNodeClient({ api_key: "test" });
console.log(Object.keys(client));
console.log(client.speech ? Object.keys(client.speech) : "No speech property");
