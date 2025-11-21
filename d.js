// Parse AI Agent response yang return sebagai string
const aiResponse = $input.first().json;

// AI Agent output bisa di property 'output' atau 'text' atau langsung di root
let responseText = aiResponse.output || aiResponse.text || aiResponse.response || JSON.stringify(aiResponse);

// Log untuk debugging
console.log('Raw AI Response:', responseText);

// Jika responseText adalah object, convert ke string dulu
if (typeof responseText === 'object') {
  responseText = JSON.stringify(responseText);
}

// Clean up response - remove markdown code blocks jika ada
responseText = responseText
  .replace(/```json\\n?/g, '')
  .replace(/```\\n?/g, '')
  .replace(/^\\s+|\\s+$/g, '') // trim whitespace
  .replace(/\\\\n/g, '\\n') // fix escaped newlines
  .replace(/\\\\\"/g, '\"'); // fix escaped quotes
let scriptData;
try {
  // Coba parse langsung
  scriptData = JSON.parse(responseText);
  console.log('✅ Direct parse successful');
} catch (e) {
  console.log('⚠️ Direct parse failed, trying regex extraction...');

  // Jika gagal, coba extract JSON dari string
  const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
  if (jsonMatch) {
    try {
      scriptData = JSON.parse(jsonMatch[0]);
      console.log('✅ Regex extraction successful');
    } catch (e2) {
      console.error('❌ Regex extraction failed:', e2.message);
      console.error('Extracted text:', jsonMatch[0].substring(0, 500));
      // Last resort: manual parsing jika JSON rusak
      throw new Error('Failed to parse JSON from AI response. Raw response: ' + responseText.substring(0, 200));
    }
  } else {
    console.error('❌ No JSON found in response');
    console.error('Response preview:', responseText.substring(0, 500));
    throw new Error('No JSON object found in AI response');
  }
}

// Validasi required fields\nconst requiredFields = ['hook', 'body', 'cta', 'caption', 'hashtags'];
const missingFields = requiredFields.filter(field => !scriptData[field]);
if (missingFields.length > 0) {
  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
}

// Ambil data dari Topic Selector
const inputData = $('Topic Selector').first().json;

// Format hashtags - handle both array and string
let hashtagsArray = [];
if (Array.isArray(scriptData.hashtags)) {
  hashtagsArray = scriptData.hashtags;
} else if (typeof scriptData.hashtags === 'string') {
  // Split by space or comma
  hashtagsArray = scriptData.hashtags.split(/[,\\s]+/).filter(tag => tag.trim());
}

const hashtagString = hashtagsArray
  .map(tag => tag.trim())
  .map(tag => tag.startsWith('#') ? tag : '#' + tag)
  .join(' ');

// Gabungkan caption dengan hashtags
const finalCaption = `${scriptData.caption}\\n\\n${hashtagString}`;

// SEO keywords - handle both array and string
let seoKeywords = [];
if (Array.isArray(scriptData.seo_keywords)) {
  seoKeywords = scriptData.seo_keywords;
} else if (typeof scriptData.seo_keywords === 'string') {
  seoKeywords = scriptData.seo_keywords.split(',').map(k => k.trim());
}
// Text overlays - handle both array and string
let textOverlays = [];
if (Array.isArray(scriptData.text_overlays)) {
  textOverlays = scriptData.text_overlays;
} else if (typeof scriptData.text_overlays === 'string') {
  textOverlays = scriptData.text_overlays.split(',').map(t => t.trim());
}
// Return formatted data
return {
  niche: inputData.niche,
  topic: inputData.topic,
  trending: inputData.trending,
  videoType: inputData.videoType,
  hook: scriptData.hook,
  body: scriptData.body,
  cta: scriptData.cta,
  caption: finalCaption,
  caption_only: scriptData.caption,
  hashtags: hashtagString,
  hashtags_array: hashtagsArray,
  text_overlays: textOverlays,
  seo_keywords: seoKeywords,
  full_script: scriptData.full_script || `${scriptData.hook}
   ${scriptData.body}
   ${scriptData.cta}`,
  created_at: new Date().toISOString(),
  status: 'generated',
  ai_model: 'gemini-ai-agent',
  raw_response: responseText.substring(0, 500) // Save first 500 chars for debugging
};
