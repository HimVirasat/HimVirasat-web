import { supabase } from "../../services/supabase.js";

export async function fetchDialects() {
  const { data, error } = await supabase
    .from("dialects")
    .select("name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ? data.map((row) => row.name) : [];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ? data.map((row) => row.name) : [];
}

export async function fetchPartsOfSpeech() {
  const { data, error } = await supabase
    .from("parts_of_speech")
    .select("name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ? data.map((row) => row.name) : [];
}

export async function generateLinguisticMetadata(input: any) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

  const prompt = buildPrompt(input);
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "Himvirasat Linguistic Generator",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a precise linguistic JSON generator for Himachali/Pahadi dialects.",
          },
          { role: "user", content: prompt },
        ],
      }),
    },
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${text}`);
  }
  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "{}";
  const parsed = parseCleanJSON(rawContent);
  return { model, data: parsed };
}

function buildPrompt(input: any) {
  const { word_devanagari, meaning_hindi, meaning_english, example_sentence } =
    input;
  return `You are an expert linguist specializing in Western Pahadi / Himachali dialects, Devanagari script, Takri script, and IPA phonetics.
Based on the following lexical entry:
- Word (Devanagari): ${word_devanagari}
- Hindi Meaning: ${meaning_hindi || "N/A"}
- English Meaning: ${meaning_english || "N/A"}
- Example Sentence (Pahadi Devanagari): ${example_sentence || "N/A"}

Generate the following metadata accurately:
1. "word_latin": Accurate Romanization/Latin transliteration for the word.
2. "word_takri": Transliteration of the word into Takri script (Unicode).
3. "ipa": International Phonetic Alphabet representation of the word.
4. "example_sentence_latin": Romanised transliteration of the example sentence.
5. "example_sentence_takri": Takri script transcription of the example sentence.

Respond ONLY with a valid JSON object matching this structure:
{
  "word_latin": "...",
  "word_takri": "...",
  "ipa": "...",
  "example_sentence_latin": "...",
  "example_sentence_takri": "..."
}`;
}

function parseCleanJSON(raw: string) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}
