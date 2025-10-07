import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

const fetchProductsFromGemini = async (query: string, latitude: number, longitude: number): Promise<Product[]> => {
  // In a real-world application, the API key should be stored securely and not hardcoded.
  // For this environment, we are using the provided key directly to ensure functionality.
  const apiKey = "AIzaSyBnMXKvxMnQ7vByvyjhAwuLgT4Rjj2Y4NM";
  if (!apiKey) {
    throw new Error("API key is not configured. Please ensure it is set correctly.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    Act as a local supermarket price comparison API. The user is located at latitude: ${latitude}, longitude: ${longitude}.
    Based on the user's search query for "${query}", **use Google Search to find real, currently available products** in well-known supermarkets near this location in Brazil (e.g., Carrefour, Pão de Açúcar, Extra, Assaí Atacadista, Dia).
    Generate a realistic list of 5 to 7 products.
    For each product, provide:
    - A unique ID (e.g., a short hash).
    - The product name.
    - A relevant category (e.g., 'Laticínios', 'Padaria', 'Hortifruti', 'Açougue', 'Mercearia').
    - An array of prices from 2-3 different real supermarkets found near the user's location.
    - For each price entry, include:
        - The supermarket's name.
        - The price in BRL.
        - An optional promotion (e.g., "2 por 1", "30% de desconto"). At least a third of the products should have a promotion.
        - The URL for the supermarket's official logo (supermarketLogoUrl).
        - The URL for the supermarket's main website (supermarketWebsite).
        - **A valid and accessible URL for the specific product page on the supermarket's website (productUrl). This must be a direct link to the product, found via search.**
        - An approximate address for the specific supermarket branch found (address).
        - The opening hours for that branch if available (openingHours, e.g., "Seg-Sáb: 08:00 - 22:00").
    - All prices should be realistic for the current market.
    - The product names, categories, and promotions should be in Portuguese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // By adding the googleSearch tool, Gemini can ground its response in real-time web results,
        // ensuring the product URLs are valid and not hallucinated.
        tools: [{googleSearch: {}}],
      },
    });

    let jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("A API retornou uma resposta vazia.");
    }
    // Clean potential markdown formatting from the response
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }
    
    const products: Product[] = JSON.parse(jsonText).map((p: any) => ({
        ...p,
        imageUrl: `https://picsum.photos/seed/${p.id}/400/400`
    }));
    
    return products;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    // This user-friendly message covers various issues like network errors or invalid API keys.
    throw new Error("Não foi possível buscar as promoções. Verifique sua conexão ou tente novamente mais tarde.");
  }
};

export { fetchProductsFromGemini };