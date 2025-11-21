const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient();

const [result] = await client.listVoices({});
const voices = result.voices;

console.log('Voices:');
voices.forEach(voice => {
  console.log(`Name: ${voice.name}`);
  console.log(`  SSML Voice Gender: ${voice.ssmlGender}`);
  console.log(`  Natural Sample Rate Hertz: ${voice.naturalSampleRateHertz}`);
  console.log('  Supported languages:');
  voice.languageCodes.forEach(languageCode => {
    console.log(`    ${languageCode}`);
  });
});
