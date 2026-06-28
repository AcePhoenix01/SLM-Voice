const fs = require("fs");
const FormData = require("form-data");
const { execSync } = require("child_process");

// Let's create a real, very short valid audio file (e.g. wav or webm) to test.
// We can use ffmpeg if available, or just send a dummy file, but dummy file might 400.
// Let's check if ffmpeg is available.
try {
  execSync("ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -y dummy.wav", { stdio: 'ignore' });
} catch (e) {
  console.log("No ffmpeg, writing dummy buffer");
  fs.writeFileSync("dummy.wav", Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]));
}

const form = new FormData();
form.append("audio", fs.createReadStream("dummy.wav"));

fetch("http://localhost:3001/api/voice/transcribe", {
  method: "POST",
  body: form,
}).then(async (res) => {
  console.log(res.status);
  console.log(await res.text());
}).catch(console.error);

