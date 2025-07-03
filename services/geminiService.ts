import { GoogleGenAI } from "@google/genai";
import type { GeneratedContent } from '../types';

// ✅ Use import.meta.env for Vite-compatible environment variables
if (!import.meta.env.VITE_API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// UPDATED: buildPrompt now only accepts topic and hasImage
function buildPrompt(
  topic: string,
  hasImage: boolean // REMOVED: captionStyle, captionLength
): string {
  const imageContext = hasImage
    ? "based on the provided image and the topic below"
    : "based on the topic below";

  let prompt = `
    You are an expert social media marketing assistant specializing in Instagram.
    Your task is to generate creative and engaging content for an Instagram post ${imageContext}.

    // --- GENERAL GUIDANCE FOR CAPTION QUALITY (As preferred previously) ---
    Focus on generating captions that are:
    - Highly engaging, encouraging likes, comments, and shares.
    - Descriptive, painting a vivid picture or conveying a clear message.
    - Optimized for Instagram's tone and audience.
    - Thought-provoking, inspiring, or entertaining.
    - Integrate 1-3 highly relevant emojis per caption, ideally at the beginning or end, or to highlight key phrases. Ensure they enhance the message and fit the overall tone.
    `;

  // REMOVED: Conditional logic for captionStyle and captionLength
  // if (captionStyle === 'professional') { ... }
  // else { ... }
  // if (captionLength === 'small') { ... }
  // else { ... }

  prompt += `

    Topic: "${topic || (hasImage ? 'Describe the main subject and mood of the image.' : 'General post')}"

    Please provide the following in a JSON object format:
    1.  "captions": An array of 5 unique, well-written, and engaging captions. Each caption should have a different tone (e.g., witty, inspirational, questioning, descriptive, minimalist, call-to-action).
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

// UPDATED: generateInstagramContent now only accepts topic and imageBase64
export const generateInstagramContent = async (
  topic: string,
  imageBase64: string | null // REMOVED: captionStyle, captionLength
): Promise<GeneratedContent> => {
  // UPDATED: Pass only topic and hasImage to buildPrompt
  const prompt = buildPrompt(topic, !!imageBase64);

  const contents = [];

  if (imageBase64) {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1],
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

    const rawText = response.text?.trim();
    if (!rawText) throw new Error("No response text received from AI.");
    let jsonStr = rawText;

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
    throw new Error("Failed to generate content. Please try again or check your internet connection.");
  }
};
