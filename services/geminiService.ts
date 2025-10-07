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
    Based on the user's search query for "${query}", generate a realistic list of 5 to 7 products available in **real, well-known supermarkets near this location** in Brazil (e.g., Carrefour, Pão de Açúcar, Extra, Assaí Atacadista, Dia).
    For each product, provide:
    - A unique ID (e.g., a short hash).
    - The product name.
    - A relevant category (e.g., 'Laticínios', 'Padaria', 'Hortifruti', 'Açougue', 'Mercearia').
    - An array of prices from 2-3 different real supermarkets found near the user's location.
    - For some products, include a special promotion (e.g., "2 por 1", "30% de desconto", "Leve 3 Pague 2"). At least a third of the products should have a promotion.
    - All prices should be in Brazilian Real (BRL) and be realistic for the current market.
    - Ensure the data is varied and makes sense for a grocery app.
    - The product names, categories, and promotions should be in Portuguese.
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
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              prices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    supermarket: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    promotion: { type: Type.STRING, nullable: true },
                  },
                  required: ["supermarket", "price"],
                },
              },
            },
            required: ["id", "name", "category", "prices"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
     if (!jsonText) {
        throw new Error("A API retornou uma resposta vazia.");
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