import 'dotenv/config';
import fs from 'fs';

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

// Read the MP3 audio file and encode as base64 data URL
const audioPath = '/home/ubuntu/loom-feedback-full_converted_20260209_131816.mp3';
const audioBuffer = fs.readFileSync(audioPath);
const audioBase64 = audioBuffer.toString('base64');
const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;
console.log(`Audio file size: ${audioBuffer.length} bytes`);

async function transcribe() {
  console.log("Sending video to LLM for transcription...");
  console.log("API URL:", FORGE_API_URL);
  
  const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FORGE_API_KEY}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "Du bist ein Transkriptions-Experte. Transkribiere die Audioaufnahme vollständig und wörtlich auf Deutsch. Achte besonders auf technische Begriffe, Seitennamen der Software und konkrete Änderungswünsche. Gib die Transkription als fortlaufenden Text wieder."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Bitte transkribiere dieses Feedback-Video zu einer Projektmanagement-Software (FaFi PM) vollständig und wörtlich. Es ist auf Deutsch gesprochen."
            },
            {
              type: "image_url",
              image_url: {
                url: audioDataUrl
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error:", response.status, errorText);
    return;
  }

  const data = await response.json();
  console.log("\nResponse:", JSON.stringify(data, null, 2).substring(0, 2000));
  if (data.choices && data.choices[0]) {
    console.log("\n=== TRANSKRIPTION ===\n");
    console.log(data.choices[0].message.content);
  }
}

transcribe().catch(console.error);
