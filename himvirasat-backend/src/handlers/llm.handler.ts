import type { Request, Response } from "express";

interface MetadataPromptInput {
  word_devanagari: string;
  meaning_hindi?: string;
  meaning_english?: string;
  example_sentence?: string;
}

function buildLinguisticPrompt(input: MetadataPromptInput): string {
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
3. "ipa": International Phonetic Alphabet representation of the word (e.g. /pāṇī/ or /ɟʱaːkəɽiː/).
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

/**
 * Safely strips markdown code fences (```json ... ```) and parses JSON
 */
function parseCleanJSON(rawText: string): Record<string, any> {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function generateMetadataHandler(req: Request, res: Response) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message:
          "OPENROUTER_API_KEY is missing in backend environment variables.",
      });
    }

    const {
      word_devanagari,
      meaning_hindi,
      meaning_english,
      example_sentence,
    } = req.body;

    if (!word_devanagari) {
      return res.status(400).json({
        success: false,
        message: "Devanagari word is required to generate metadata.",
      });
    }

    const prompt = buildLinguisticPrompt({
      word_devanagari,
      meaning_hindi,
      meaning_english,
      example_sentence,
    });

    // Default to Claude 3.5 Sonnet if OPENROUTER_MODEL is not set
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          // Optional site headers for OpenRouter rankings
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
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Failure:", errorText);
      return res.status(response.status).json({
        success: false,
        message: `OpenRouter Request Failed (${response.status}): ${errorText}`,
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    const parsedData = parseCleanJSON(rawContent);

    return res.status(200).json({
      success: true,
      model,
      data: parsedData,
    });
  } catch (error: any) {
    console.error(
      "Internal catch error inside generateMetadataHandler:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate metadata using OpenRouter",
    });
  }
}
