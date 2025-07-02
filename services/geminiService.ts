import { GoogleGenAI } from "@google/genai";
import type { GeneratedContent } from '../types';

// ✅ Use import.meta.env for Vite-compatible environment variables
if (!import.meta.env.VITE_API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// UPDATED: buildPrompt now accepts captionStyle and captionLength
function buildPrompt(
  topic: string,
  hasImage: boolean,
  captionStyle: 'basic' | 'professional', // NEW PARAMETER
  captionLength: 'small' | 'big'          // NEW PARAMETER
): string {
  const imageContext = hasImage
    ? "based on the provided image and the topic below"
    : "based on the topic below";

  let prompt = `
    You are an expert social media marketing assistant specializing in Instagram.
    Your task is to generate creative and engaging content for an Instagram post ${imageContext}.`;

  // Add style preference to the prompt based on the new parameter
  if (captionStyle === 'professional') {
    prompt += ` The caption should have a sophisticated and polished tone, suitable for students or individual professionals sharing personal insights or academic content. Use advanced and high-level English vocabulary, but avoid overly corporate or marketing jargon.`; // <-- UPDATED LINE
} else { // 'basic'
    prompt += ` The caption should be basic, simple, and straightforward, suitable for a personal post. Use common, easy-to-understand English words.`;
}

  // Add length preference to the prompt based on the new parameter
  if (captionLength === 'small') {
    prompt += ` Each caption must be extremely short, ideally around 3 to 5 words maximum. Do not exceed this length.`;
  } else { // 'big'
    prompt += ` Make the captions detailed and comprehensive, potentially including multiple sentences or paragraphs.`;
  }

  prompt += `

    Topic: "${topic || (hasImage ? 'Describe the main subject and mood of the image.' : 'General post')}"

    Please provide the following in a JSON object format:
    1.  "captions": An array of 5 unique, well-written, and engaging captions. Each caption should have a different tone (e.g., witty, inspirational, questioning, descriptive, minimalist).
    2.  "hashtags": An array of 20 relevant hashtags. Mix popular, niche, and specific hashtags.

    The final output MUST be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.

    Example JSON structure:
    {
      "captions": [
        "Caption 1...",
        "Caption 2...",
        "Caption 3...",
        "Caption 4...",
        "Caption 5..."
      ],
      "hashtags": [
        "#hashtag1",
        "#hashtag2",
        ...
      ]
    }
  `;
  return prompt;
}

// UPDATED: generateInstagramContent now accepts style and length
export const generateInstagramContent = async (
  topic: string,
  imageBase64: string | null,
  captionStyle: 'basic' | 'professional', // NEW PARAMETER
  captionLength: 'small' | 'big'          // NEW PARAMETER
): Promise<GeneratedContent> => {
  // Pass the new parameters to buildPrompt
  const prompt = buildPrompt(topic, !!imageBase64, captionStyle, captionLength);

  const contents = [];

  if (imageBase64) {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Adjust if other image types are supported
        data: imageBase64.split(',')[1], // Remove base64 prefix
      },
    };
    contents.push(imagePart);
  }

  contents.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
        topP: 0.95,
      },
    });

    // ✅ Handle possible undefined response
    const rawText = response.text?.trim();
    if (!rawText) throw new Error("No response text received from AI.");
    let jsonStr = rawText;

    // Remove triple backticks if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr) as GeneratedContent;

    if (!parsedData.captions || !parsedData.hashtags) {
      throw new Error("AI response is missing required fields (captions/hashtags).");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
      throw new Error("Failed to parse the AI's response. The format was invalid. Please try again.");
    }
    // Updated error message to be more generic, as discussed
    throw new Error("Failed to generate content. Please try again or check your internet connection.");
  }
};
