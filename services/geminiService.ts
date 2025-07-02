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
  captionStyle: 'basic' | 'professional',
  captionLength: 'small' | 'big'
): string {
  const imageContext = hasImage
    ? "based on the provided image and the topic below"
    : "based on the topic below";

  let prompt = `
    You are an expert social media marketing assistant specializing in Instagram.
    Your task is to generate creative and engaging content for an Instagram post ${imageContext}.

    // --- GUIDANCE FOR CAPTION QUALITY (Suggested Improvements) ---
    Focus on generating captions that are:
    - Highly engaging, encouraging likes, comments, and shares.
    - Descriptive, painting a vivid picture or conveying a clear message.
    - Optimized for Instagram's tone and audience.
    - Thought-provoking, inspiring, or entertaining.
    - Each caption MUST include 1-3 highly relevant and expressive emojis. Place them strategically at the beginning, end, or within the text to enhance the message and fit the overall tone.
    `;

  // Add style preference to the prompt based on the new parameter
  if (captionStyle === 'professional') {
  prompt += ` The caption should maintain a refined, intelligent tone. It must be appropriate for professionals, students, or individuals aiming to share thoughtful or inspiring content. Use elevated vocabulary and sentence structure, but keep it readable and relatable. Avoid promotional or corporate-sounding language.`;
} else { // 'basic'
  prompt += ` The caption should be casual, personal, and easy to understand. Use simple everyday language suitable for general Instagram users sharing personal photos. Keep the tone warm, natural, and relatable.`;
}

if (captionLength === 'small') {
  prompt += ` Each caption must be very short — ideally a single phrase or sentence of no more than 5 to 6 words. Keep it catchy, but concise.`;
} else { // 'big'
  prompt += ` Each caption should be more detailed and expressive, consisting of multiple sentences if needed. Ensure smooth flow and emotional engagement while keeping the text easy to read.`;
}

  prompt += `

    Topic: "${topic || (hasImage ? 'Describe the main subject and mood of the image.' : 'General post')}"

    Please provide the following in a JSON object format:
    1.  "captions": An array of 5 unique, well-written, and engaging captions. Each caption should have a different tone. Explicitly ensure the tones are distinct (e.g., witty, inspirational, questioning, descriptive, minimalist, call-to-action).
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
  captionStyle: 'basic' | 'professional',
  captionLength: 'small' | 'big'
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
    // Updated error message to be more generic
    throw new Error("Failed to generate content. Please try again or check your internet connection.");
  }
};
