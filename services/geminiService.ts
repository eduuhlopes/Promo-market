import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

const fetchProductsFromGemini = async (query: string, latitude: number, longitude: number): Promise<Product[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    throw new Error("Ocorreu um problema de configuração que impede a busca. Por favor, tente novamente mais tarde.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const products: Product[] = JSON.parse(jsonText).map((p: any) => ({
        ...p,
        imageUrl: `https://picsum.photos/seed/${p.id}/400/400`
    }));
    
    return products;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    throw new Error("Falha ao obter os dados dos produtos. Por favor, tente novamente.");
  }
};

export { fetchProductsFromGemini };