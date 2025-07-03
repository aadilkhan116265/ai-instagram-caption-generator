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
    Your primary goal is to generate Instagram captions that are incredibly engaging, highly original, and perfectly suited for the given topic and image. Make the audience say "Wow!"

    Your task is to generate diverse and compelling content for an Instagram post ${imageContext}.

    // --- ENHANCED GUIDANCE FOR CAPTION QUALITY & STRUCTURE ---
    Please generate 5 unique captions that are highly engaging, impactful, and demonstrate variety in tone and style.
    Each caption should follow these guidelines:
    - **Originality & Creativity**: Avoid clichés and generic phrases. Infuse personality, wit, and genuine emotion. Make them fresh and memorable.
    - **Descriptive & Evocative**: Paint a vivid picture or convey a deep message relevant to the topic. Show, don't just tell.
    - **Emoji Integration**: Integrate 1-3 *perfectly fitting* and expressive emojis per caption. Emojis should complement the caption's mood, tone, and message, making it more visually appealing and impactful.
    - **Conciseness & Impact**: Every caption, regardless of its specific style, must be impactful. If short, make every word count. If longer, ensure it's well-structured and engaging throughout.
    - **Call to Action (Optional)**: Some captions can include a subtle call-to-action to encourage interaction (e.g., asking a question).

    Aim to provide a variety across the 5 captions, covering some of these styles/lengths:
    - **Short & Punchy**: 5-10 words, designed for immediate impact.
    - **Engaging Question**: A question-based caption to spark comments.
    - **Reflective/Inspirational**: A caption that shares a thought or inspires.
    - **Descriptive Narrative**: A slightly longer caption that tells a mini-story or provides more context.
    - **Witty/Humorous**: A playful or funny caption.

    Topic: "${topic || (hasImage ? 'Describe the main subject and mood of the image.' : 'General post')}"

    Please provide the following in a JSON object format:
    1.  "captions": An array of exactly 5 unique, well-written, and engaging captions, adhering to the diverse styles and qualities outlined above.
    2.  "hashtags": An array of 20 highly relevant and trending hashtags. Mix popular, niche, and specific hashtags to maximize discoverability.

    The final output MUST be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.

    Example JSON structure:
    {
      "captions": [
        "Caption 1: [Short & Punchy] text with emoji ⚡️",
        "Caption 2: [Engaging Question] text with emoji 🤔",
        "Caption 3: [Reflective/Inspirational] text with emoji ✨",
        "Caption 4: [Descriptive Narrative] text with emoji 📸",
        "Caption 5: [Witty/Humorous] text with emoji 😂"
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
