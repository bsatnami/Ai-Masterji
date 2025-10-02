import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Settings, StyleAnalysis } from '../types';

// FIX: Per coding guidelines, initialize without the non-null assertion (!) on the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeStyleReference = async (styleImage: File): Promise<StyleAnalysis> => {
    const stylePart = await fileToGenerativePart(styleImage);
    const prompt = `
    As a professional creative director, analyze the provided style reference image. Deconstruct its aesthetic into a structured JSON format. Your analysis must be precise and detailed.
    - "palette": Extract exactly 5-7 dominant and accent colors as HEX codes.
    - "lighting": Describe the lighting style (e.g., 'warm rim light', 'soft diffuse studio light', 'dramatic chiaroscuro').
    - "composition": Describe the compositional principles (e.g., 'Rule of Thirds, subject on left vertical', 'Centered hero shot', 'Dynamic leading lines').
    - "textures": Identify key surface textures (e.g., 'rough canvas', 'glossy plastic', 'metallic sheen', 'soft fabric').
    - "vibe": Summarize the overall mood or artistic vibe in one or two words (e.g., 'Minimalist & Clean', 'Retro & Grungy', 'Epic & Cinematic').
    - "keywords": Provide a list of relevant keywords that describe the style, elements, and mood.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [stylePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                    lighting: { type: Type.STRING },
                    composition: { type: Type.STRING },
                    textures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    vibe: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const analysis = JSON.parse(jsonText);
        if (analysis && Array.isArray(analysis.palette)) {
            return analysis as StyleAnalysis;
        }
        throw new Error("Invalid JSON structure returned from style analysis.");
    } catch (e) {
        console.error("Failed to parse style analysis:", e);
        throw new Error("Could not analyze the style image.");
    }
};

export const generatePosterFromReference = async (
  productImages: File[],
  styleImage: File,
  styleAnalysis: StyleAnalysis,
  settings: Settings
): Promise<{ imageUrl: string; masterPrompt: string }> => {
  const productParts = await Promise.all(productImages.map(fileToGenerativePart));
  const stylePart = await fileToGenerativePart(styleImage);

  const styleDescription = `
    **Style Deconstruction:**
    -   **Vibe:** ${styleAnalysis.vibe}
    -   **Color Palette:** Use this exact palette: ${styleAnalysis.palette.join(', ')}.
    -   **Lighting:** Recreate this lighting precisely: ${styleAnalysis.lighting}.
    -   **Composition:** Follow this compositional rule: ${styleAnalysis.composition}.
    -   **Textures & Materials:** Incorporate these textures: ${styleAnalysis.textures.join(', ')}.
    -   **Keywords:** ${styleAnalysis.keywords.join(', ')}.
  `;

  const prompt = `
    **Primary Goal:** Create a photorealistic, pro-grade, high-resolution promotional poster. You are a master of visual effects and 3D rendering. Your task is to integrate a product into a scene that perfectly matches the provided style deconstruction and reference image.

    **Inputs:**
    1.  **Product Image(s):** The primary subject(s).
    2.  **Style Reference Image:** The visual source of the entire aesthetic.
    3.  **Detailed Style Deconstruction:** A JSON-derived analysis of the target aesthetic. Use this for precise instructions.
    4.  **User's Creative Brief:** "${settings.prompt}"

    **Execution Steps & Advanced Techniques:**
    1.  **Analyze Product & Masking:** Identify the product(s). Perform a perfect, high-fidelity background removal (alpha masking), preserving all fine details. The product's shape, proportions, and text must be perfectly preserved.
    2.  **Replicate Scene from Reference & Deconstruction:** Your main task is to use the Style Reference Image as the primary visual guide, and the Style Deconstruction text for specific details. **You MUST strictly adhere to the reference image's background, color palette, lighting, composition, and textures.** Do not invent a new style. The goal is to make it look as if the product was originally photographed in this meticulously crafted scene.
    3.  **Composite & Enhance (3D Realism):** Seamlessly integrate the masked product(s) into the newly generated scene. Apply advanced 3D rendering techniques:
        *   **PBR Materials:** Infer and apply Physically Based Rendering materials to the product for realistic light interaction.
        *   **Normal Map Inference:** Imagine and apply micro-surface details to create realistic texture, making the 2D product appear fully 3D.
        *   **Subsurface Scattering (SSS):** If the product is organic or translucent, apply SSS to simulate light penetrating its surface for a natural look.
        *   **Realistic Contact Shadows & Light Wrap:** Generate soft, context-aware shadows where the product meets surfaces. Create a subtle "light wrap" effect where background light bleeds around the product's edges to blend it into the scene.
    4.  **Apply Technical Settings:** Strictly adhere to the user's specifications:
        *   Aspect Ratio: ${settings.aspectRatio}
        *   Lighting Style Override (if user prompt is specific): ${settings.lightingStyle}
        *   Camera Perspective: ${settings.cameraPerspective}
    5.  **Final Quality:** The output must be ultra-realistic, with the sharpness and detail of an 8K resolution photograph. It must possess a sense of 3D depth, high-end commercial polish, and masterful lighting.

    **Required Text Output:**
    In addition to the image, you MUST provide a "master prompt". This master prompt should be a detailed, comprehensive description of the final image you created, as if you were instructing another AI. Describe the scene, product integration, 3D enhancements, lighting, and style in professional detail.
    
    The final output must contain both the generated image and the text master prompt.

    ---
    ${styleDescription}
    ---
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [...productParts, stylePart, { text: prompt }] },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  let imageUrl = '';
  let masterPrompt = 'New Poster - Master prompt not generated.';
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      masterPrompt = part.text;
    }
  }

  if (!imageUrl) {
    throw new Error("Image generation failed, no image returned.");
  }
  return { imageUrl, masterPrompt };
};

export const editPoster = async (baseImageBase64: string, editPrompt: string): Promise<string> => {
    const imagePart = { inlineData: { data: baseImageBase64, mimeType: 'image/jpeg' } };
    const textPart = { text: `Apply this edit to the image: "${editPrompt}". Only change what is requested and preserve the rest of the image quality and style.` };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("Image edit failed, no image returned.");
};

export const generatePromptSuggestions = async (
    productImages: File[],
    styleImage: File
): Promise<string[]> => {
    const productParts = await Promise.all(productImages.map(fileToGenerativePart));
    const stylePart = await fileToGenerativePart(styleImage);

    const prompt = `Analyze the provided product image(s) and the style reference image. Based on them, generate exactly 3 diverse, creative, one-sentence prompts for a promotional poster. The prompts should be concise and inspiring. Return the result as a JSON array of strings. Example: ["A refreshing drink on a vibrant, sun-drenched beach.", "The product featured in a sleek, minimalist studio setting.", "An epic, cinematic shot of the product on a mountain peak."]`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [...productParts, stylePart, { text: prompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    try {
        // FIX: Per coding guidelines, when responseSchema is used, response.text is a clean JSON string and doesn't need extra parsing.
        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (e) {
        console.error("Failed to parse prompt suggestions:", e);
        return [];
    }
};
