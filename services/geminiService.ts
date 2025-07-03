import { GoogleGenAI } from "@google/genai";
import type { GeneratedContent } from '../types';

// ✅ Use import.meta.env for Vite-compatible environment variables
if (!import.meta.env.VITE_API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// UPDATED: buildPrompt to enhance caption quality for "wow factor"
function buildPrompt(
  topic: string,
  hasImage: boolean
): string {
  const imageContext = hasImage
    ? "based on the provided image and the topic below"
    : "based on the topic below";

  let prompt = `
    You are an elite, viral content creator and a highly insightful social media marketing assistant specializing in Instagram.
    Your primary goal is to generate captions that immediately grab attention, evoke strong emotion, and compel interaction. Make the audience say "Wow!"

    Your task is to generate creative and highly engaging content for an Instagram post ${imageContext}.

    // --- ENHANCED GUIDANCE FOR CAPTION QUALITY (For "Wow" Factor) ---
    Focus on generating captions that are:
    - **Highly Engaging & Impactful**: Go beyond simple descriptions. Encourage likes, comments, shares, and real conversation.
    - **Original & Creative**: Avoid clichés and generic phrases. Infuse personality, wit, and genuine emotion. Make them fresh and memorable.
    - **Descriptive & Evocative**: Paint a vivid picture or convey a deep message. Show, don't just tell.
    - **Optimized for Instagram's Audience**: Understand what resonates on Instagram (e.g., authenticity, visual appeal, concise yet impactful text).
    - **Contextually Rich**: Integrate details from the topic and image description seamlessly.
    - **Appropriate Length & Punch**: Whether short or long, every caption must be interesting and impactful.
      * For shorter captions, make every word count – concise, witty, or profound. They should grab attention instantly.
      * For longer captions, structure them well (e.g., mini-story, thought piece, list) and maintain engagement throughout. Break them into readable paragraphs if necessary.
    - **Emoji Integration**: Integrate 1-3 *perfectly matching* and expressive emojis per caption. Place them strategically (beginning, end, or to highlight key phrases) to enhance the mood and theme of each caption. Ensure they are relevant and add value, not just clutter.
    `;

  prompt += `

    Topic: "${topic || (hasImage ? 'Describe the main subject and mood of the image.' : 'General post')}"

    Please provide the following in a JSON object format:
    1.  "captions": An array of 5 unique, well-written, and highly engaging captions. Each caption must have a **distinctly different tone and approach** (e.g., witty, inspirational, questioning, descriptive, minimalist, call-to-action, storytelling, humorous, reflective, empowering).
    2.  "hashtags": An array of 20 highly relevant and trending hashtags. Mix popular, niche, and specific hashtags to maximize discoverability.

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
  imageBase64: string | null
): Promise<GeneratedContent> => {
  // Pass only topic and hasImage to buildPrompt
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
        temperature: 0.8, // You might experiment with this, higher means more creative/random
        topP: 0.95,       // Controls diversity of words, higher means more diverse
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) throw new Error("No response text received from AI.");
    let jsonStr = rawText;

    // Remove triple backticks if present (common for JSON responses from AI)
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
