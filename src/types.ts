export type DietPreference = 'Keto' | 'Vegan' | 'Vegetarian' | 'High Protein' | 'High Carbs';
export type BudgetLevel = 'Budget' | 'Moderate' | 'Premium';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarUrl?: string;
}

export interface UserPreferences {
  diet: DietPreference;
  allergies: string[];
  budget: BudgetLevel;
  cuisines: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  calories: number;
  budget: BudgetLevel;
  estimatedCost: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  nutrients: {
    protein: string;
    carbs: string;
    fat: string;
  };
  tags: string[];
}

export interface Review {
  id: string;
  recipeId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
