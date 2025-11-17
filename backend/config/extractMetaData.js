import axios from 'axios';

export const extractMetadataWithGemini = async (title, description) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const prompt = `
Given the following academic project details:
Title: ${title}
Description: ${description}

Extract ONLY the following as pure JSON:
{
  "technologies": [],
  "tags": [],
  "domain": ""
}
NO explanation, no markdown, no backticks.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    // Extract raw text returned by Gemini
    let textResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Gemini Raw:", textResponse);

    // Clean markdown code blocks, backticks, and leading/trailing noise
    let cleaned = textResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^json\s*/i, "")
      .trim();

    // Try parsing JSON safely
    let metaData = {};
    try {
      metaData = JSON.parse(cleaned);
    } catch (err) {
      console.log("JSON Parsing Failed → Using fallback.");
      metaData = { technologies: [], domain: "", tags: [] };
    }

    return metaData;

  } catch (error) {
    console.error("Error extracting metadata with Gemini:", error);
    return { technologies: [], domain: "", tags: [] };
  }
};
