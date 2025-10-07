import { GoogleGenAI, Type } from "@google/genai";
import { Product, ProductPrice } from '../types';

// In a real-world application, the API key should be stored securely and not hardcoded.
// For this environment, we are using the provided key directly to ensure functionality.
const apiKey = "AIzaSyBnMXKvxMnQ7vByvyjhAwuLgT4Rjj2Y4NM";
if (!apiKey) {
  throw new Error("API key is not configured. Please ensure it is set correctly.");
}
const ai = new GoogleGenAI({ apiKey: apiKey });

const cleanJson = (text: string): string => {
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.substring(7, jsonText.length - 3).trim();
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.substring(3, jsonText.length - 3).trim();
  }
  return jsonText;
};

/**
 * Step 1: Fetches a list of product suggestions quickly.
 * This call is optimized for speed by NOT using Google Search and only asking for basic product info.
 */
const fetchProductsFromGemini = async (query: string): Promise<Product[]> => {
  const prompt = `
    Act as a product suggestion API. Based on the user's search query for "${query}", generate a realistic list of 5 to 7 specific product names that could be found in Brazilian supermarkets.
    For each product, provide:
    - A unique ID (e.g., a short hash).
    - The product name (e.g., "Leite Integral Piracanjuba 1L").
    - A relevant category in Portuguese (e.g., 'Laticínios', 'Padaria', 'Hortifruti').
    
    The response should be a JSON array of objects. Do not include prices or supermarket data. This should be a very fast response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique identifier for the product." },
              name: { type: Type.STRING, description: "The full name of the product." },
              category: { type: Type.STRING, description: "The product category in Portuguese." },
            },
            required: ['id', 'name', 'category'],
          }
        }
      },
    });

    const jsonText = cleanJson(response.text);
    if (!jsonText) {
        throw new Error("A API retornou uma resposta vazia.");
    }
    
    const products: Product[] = JSON.parse(jsonText).map((p: any) => ({
        ...p,
        imageUrl: `https://picsum.photos/seed/${p.id}/400/400`,
        prices: [] // Prices will be fetched on demand
    }));
    
    return products;
  } catch (error) {
    console.error("Error fetching initial products from Gemini API:", error);
    throw new Error("Não foi possível buscar os produtos. Verifique sua conexão ou tente novamente mais tarde.");
  }
};

/**
 * Step 2: Fetches detailed pricing information for a SINGLE product on demand.
 * This call is more intensive as it uses Google Search to find real-time, localized data.
 */
const fetchProductPricesFromGemini = async (productName: string, latitude: number, longitude: number): Promise<ProductPrice[]> => {
    const prompt = `
    Act as a local supermarket price comparison API. The user is located at latitude: ${latitude}, longitude: ${longitude}.
    The user wants to find prices for the product: "${productName}".

    **Use Google Search to find real, currently available prices** for this specific product in well-known supermarkets near the user's location in Brazil (e.g., Carrefour, Pão de Açúcar, Extra, Assaí Atacadista, Dia).
    
    Generate an array of 2-3 price options from different real supermarkets.
    For each price entry, provide:
    - The supermarket's name.
    - The price in BRL.
    - An optional promotion (e.g., "2 por 1", "30% de desconto").
    - The URL for the supermarket's official logo (supermarketLogoUrl).
    - The URL for the supermarket's main website (supermarketWebsite).
    - **A valid and accessible URL for the specific product page on the supermarket's website (productUrl). This must be a direct link to the product, found via search.**
    - An approximate address for the specific supermarket branch found (address).
    - The opening hours for that branch if available (openingHours, e.g., "Seg-Sáb: 08:00 - 22:00").
    
    All prices must be realistic for the current market. All text should be in Portuguese.
    The response must be a JSON array of price objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const jsonText = cleanJson(response.text);
    if (!jsonText) {
        // Return an empty array if no prices are found, which is a valid scenario.
        return [];
    }
    
    const prices: ProductPrice[] = JSON.parse(jsonText);
    return prices;
  } catch (error) {
    console.error(`Error fetching prices for "${productName}" from Gemini API:`, error);
    // Let the caller handle the error, so it can display a message in the specific card.
    throw new Error(`Não foi possível buscar os preços para ${productName}.`);
  }
}


export { fetchProductsFromGemini, fetchProductPricesFromGemini };