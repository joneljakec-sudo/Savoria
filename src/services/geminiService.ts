import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserPreferences } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const FALLBACK_RECIPES: Recipe[] = [
  {
    id: 'fallback-1',
    title: 'Classic Adobo',
    description: 'A Filipino staple made with chicken or pork, soy sauce, vinegar, and garlic.',
    prepTime: '45 mins',
    calories: 350,
    budget: 'Budget',
    estimatedCost: 75,
    difficulty: 'Easy',
    ingredients: ['500g Chicken', '1/2 cup Soy Sauce', '1/4 cup Vinegar', '5 cloves Garlic', 'Peppercorns', 'Bay leaves'],
    instructions: [
      'Marinate chicken in soy sauce and garlic for 30 mins.',
      'In a pot, bring the chicken and marinade to a boil.',
      'Add vinegar, peppercorns, and bay leaves.',
      'Simmer until chicken is tender.',
      'Optional: Fry the chicken for a crispy texture.',
      'Serve with warm rice.'
    ],
    nutrients: { protein: '25g', carbs: '5g', fat: '15g' },
    tags: ['Filipino', 'Classic', 'Budget'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fallback-2',
    title: 'Garlic Butter Shrimp',
    description: 'Quick and delicious shrimp sautéed in a rich garlic butter sauce.',
    prepTime: '15 mins',
    calories: 280,
    budget: 'Moderate',
    estimatedCost: 120,
    difficulty: 'Easy',
    ingredients: ['250g Shrimp', '4 tbsp Butter', '6 cloves Garlic', 'Lemon juice', 'Parsley'],
    instructions: [
      'Melt butter in a pan over medium heat.',
      'Add minced garlic and sauté until fragrant.',
      'Add shrimp and cook until pink and opaque.',
      'Squeeze lemon juice over the shrimp.',
      'Garnish with fresh parsley.',
      'Serve immediately.'
    ],
    nutrients: { protein: '20g', carbs: '2g', fat: '18g' },
    tags: ['Seafood', 'Quick', 'Moderate'],
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
  }
];

const FOOD_FALLBACKS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // Salad
  'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=800&q=80', // Pancakes
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', // Pizza
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80', // Sandwich
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // Steak/Meat
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80', // Pasta
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80', // Platter
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80', // Breakfast
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', // Grilled Chicken
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80', // Dessert
];

function getFallbackImage(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('salad')) return FOOD_FALLBACKS[0];
  if (lowerTitle.includes('pancake') || lowerTitle.includes('breakfast')) return FOOD_FALLBACKS[1];
  if (lowerTitle.includes('pizza')) return FOOD_FALLBACKS[2];
  if (lowerTitle.includes('sandwich') || lowerTitle.includes('burger')) return FOOD_FALLBACKS[3];
  if (lowerTitle.includes('steak') || lowerTitle.includes('meat') || lowerTitle.includes('beef') || lowerTitle.includes('pork')) return FOOD_FALLBACKS[4];
  if (lowerTitle.includes('pasta') || lowerTitle.includes('noodle')) return FOOD_FALLBACKS[5];
  if (lowerTitle.includes('chicken')) return FOOD_FALLBACKS[8];
  if (lowerTitle.includes('dessert') || lowerTitle.includes('sweet') || lowerTitle.includes('cake')) return FOOD_FALLBACKS[9];
  
  // Default to a high-quality platter image if no keywords match
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FOOD_FALLBACKS[hash % FOOD_FALLBACKS.length];
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  return getFallbackImage(prompt);
}

const IMAGE_LIBRARY = [
  { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', category: 'Salad / Healthy / Greens' },
  { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=800&q=80', category: 'Pancakes / Breakfast / Sweet' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', category: 'Pizza / Italian / Cheesy' },
  { url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80', category: 'Sandwich / Burger / Wrap' },
  { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', category: 'Steak / Beef / Roasted Meat' },
  { url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80', category: 'Pasta / Noodles / Spaghetti' },
  { url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80', category: 'Platter / Appetizers / Diverse' },
  { url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80', category: 'Breakfast / Toast / Eggs' },
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', category: 'Grilled Chicken / Poultry / BBQ' },
  { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80', category: 'Dessert / Cake / Pastry' },
  { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', category: 'Buddha Bowl / Vegan / Quinoa' },
  { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', category: 'Fresh Salad / Gourmet / Veggie' },
  { url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80', category: 'Tacos / Mexican / Street Food' },
  { url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', category: 'Soup / Stew / Ramen' },
  { url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', category: 'Seafood / Fish / Salmon' },
  { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', category: 'Pizza / Flatbread / Artisan' },
  { url: 'https://images.unsplash.com/photo-1569058242253-92a9c71f9867?auto=format&fit=crop&w=800&q=80', category: 'Dumplings / Asian / Dim Sum' },
  { url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80', category: 'Fruit Platter / Healthy / Colorful' },
  { url: 'https://images.unsplash.com/photo-1504754668076-b74b0ce3d74f?auto=format&fit=crop&w=800&q=80', category: 'Sushi / Japanese / Rolls' },
  { url: 'https://images.unsplash.com/photo-1506084868730-342b1f852e0d?auto=format&fit=crop&w=800&q=80', category: 'Oatmeal / Porridge / Berries' }
];

export async function generateRecipes(preferences: UserPreferences): Promise<Recipe[]> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using fallback recipes.");
    return FALLBACK_RECIPES;
  }
  
  const imageLibraryString = IMAGE_LIBRARY.map(img => `- ${img.url} (Best for: ${img.category})`).join('\n');

  const prompt = `Generate 6 unique recipe recommendations for a user with the following preferences:
    Diet: ${preferences.diet}
    Allergies: ${preferences.allergies.join(", ") || "None"}
    Budget: ${preferences.budget} (Currency: PHP)
    Price Ranges for Budget Levels:
    - Budget: 50 to 80 PHP
    - Moderate: 100 to 130 PHP
    - Premium: 250 to 350 PHP
    
    Favorite Cuisines: ${preferences.cuisines.join(", ") || "Any"}
    
    Ensure the recipes are diverse and fit the budget level. 
    
    IMPORTANT: 
    1. Provide very descriptive and specific titles for the recipes.
    2. Include an "estimatedCost" field which is a numeric value in Philippine Pesos (PHP).
    3. Include the diet type ("${preferences.diet}") in the "tags" array.
    4. For the "image" field, you MUST select the most relevant URL from this permanent library. Choose the one that best matches the dish you are creating:
    ${imageLibraryString}
    
    5. Provide detailed, step-by-step instructions (at least 6-8 steps).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              budget: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              difficulty: { type: Type.STRING },
              image: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fat: { type: Type.STRING }
                }
              },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "description", "prepTime", "calories", "budget", "estimatedCost", "difficulty", "image", "ingredients", "instructions", "nutrients", "tags"]
          }
        }
      }
    });

    const text = response.text || "[]";
    let recipes: Recipe[] = [];
    try {
      recipes = JSON.parse(text) as Recipe[];
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, text);
      return FALLBACK_RECIPES;
    }
    
    recipes = recipes.map(r => ({
      ...r,
      calories: Number(r.calories) || 0,
      estimatedCost: Number(r.estimatedCost) || 0,
      instructions: Array.isArray(r.instructions) ? r.instructions : [],
      ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      tags: Array.isArray(r.tags) ? r.tags : [],
      nutrients: r.nutrients || { protein: '0g', carbs: '0g', fat: '0g' },
      image: r.image || IMAGE_LIBRARY[6].url // Fallback to platter if AI misses it
    }));
    
    return recipes;
  } catch (error: any) {
    console.warn("Recipe generation failed, using fallback recipes:", error.message);
    return FALLBACK_RECIPES;
  }
}
