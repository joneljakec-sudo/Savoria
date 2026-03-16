import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, Review } from '../types';
import RecipeCard from './RecipeCard';
import { Heart, ChefHat, MessageSquare, Plus, Utensils } from 'lucide-react';

interface MyKitchenProps {
  favorites: Recipe[];
  cooked: Recipe[];
  userRecipes: Recipe[];
  reviews: Review[];
  onRecipeClick: (recipe: Recipe) => void;
  onPostRecipe: () => void;
  favoriteIds: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  activeTab: Tab;
}

export type Tab = 'favorites' | 'cooked' | 'posts' | 'feedbacks';

export default function MyKitchen({ 
  favorites, 
  cooked, 
  userRecipes, 
  reviews, 
  onRecipeClick,
  onPostRecipe,
  favoriteIds,
  onToggleFavorite,
  activeTab
}: MyKitchenProps) {
  const getRecipeRating = (recipeId: string) => {
    const recipeReviews = reviews.filter(r => r.recipeId === recipeId);
    if (recipeReviews.length === 0) return { average: 0, count: 0 };
    const average = recipeReviews.reduce((acc, r) => acc + r.rating, 0) / recipeReviews.length;
    return { average, count: recipeReviews.length };
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl mb-2 capitalize">
            {activeTab === 'posts' ? 'My Recipes' : activeTab === 'favorites' ? 'Saved Recipes' : activeTab}
          </h2>
          <p className="text-brand-ink-muted serif italic text-lg">
            {activeTab === 'favorites' && "Dishes you've saved to your profile."}
            {activeTab === 'cooked' && "A timeline of your culinary adventures."}
            {activeTab === 'posts' && "Recipes you've shared with the community."}
            {activeTab === 'feedbacks' && "Your reviews and thoughts on recipes."}
          </p>
        </div>
        {activeTab === 'posts' && (
          <button 
            onClick={onPostRecipe}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-olive/20"
          >
            <Plus size={20} />
            Post New Recipe
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={onRecipeClick}
                      isFavorite={favoriteIds.includes(recipe.id)}
                      onToggleFavorite={(e) => onToggleFavorite(e, recipe.id)}
                      rating={getRecipeRating(recipe.id).average}
                      reviewCount={getRecipeRating(recipe.id).count}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-20 text-center border border-dashed border-black/10 dark:border-white/10">
                  <Heart className="mx-auto mb-4 text-brand-ink-subtle opacity-20" size={48} />
                  <p className="text-brand-ink-muted serif italic text-xl">Your saved recipes list is empty.</p>
                  <p className="text-sm text-brand-ink-subtle mt-2">Save recipes you love to see them here.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'cooked' && (
            <motion.div
              key="cooked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {cooked.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cooked.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={onRecipeClick}
                      isFavorite={favoriteIds.includes(recipe.id)}
                      onToggleFavorite={(e) => onToggleFavorite(e, recipe.id)}
                      rating={getRecipeRating(recipe.id).average}
                      reviewCount={getRecipeRating(recipe.id).count}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-20 text-center border border-dashed border-black/10 dark:border-white/10">
                  <ChefHat className="mx-auto mb-4 text-brand-ink-subtle opacity-20" size={48} />
                  <p className="text-brand-ink-muted serif italic text-xl">You haven't marked any recipes as cooked yet.</p>
                  <p className="text-sm text-brand-ink-subtle mt-2">Complete a recipe to add it to your history.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {userRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userRecipes.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={onRecipeClick}
                      isFavorite={favoriteIds.includes(recipe.id)}
                      onToggleFavorite={(e) => onToggleFavorite(e, recipe.id)}
                      rating={getRecipeRating(recipe.id).average}
                      reviewCount={getRecipeRating(recipe.id).count}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-20 text-center border border-dashed border-black/10 dark:border-white/10">
                  <Utensils className="mx-auto mb-4 text-brand-olive/20" size={48} />
                  <p className="text-brand-ink-muted serif italic text-xl">You haven't shared any recipes yet.</p>
                  <button onClick={onPostRecipe} className="mt-6 text-brand-olive font-bold uppercase tracking-widest text-sm hover:underline">
                    Share your first recipe
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'feedbacks' && (
            <motion.div
              key="feedbacks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map(review => (
                    <div key={review.id} className="card p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex gap-1 text-brand-clay mb-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Heart key={i} size={14} fill="currentColor" className="text-brand-clay" />
                            ))}
                          </div>
                          <div className="text-xs font-bold uppercase text-brand-ink-subtle">{review.date}</div>
                        </div>
                        <div className="bg-brand-olive/10 dark:bg-brand-olive/20 text-brand-olive px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Verified Cook
                        </div>
                      </div>
                      <p className="text-brand-ink italic text-lg leading-relaxed opacity-80">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-20 text-center border border-dashed border-black/10 dark:border-white/10">
                  <MessageSquare className="mx-auto mb-4 text-brand-ink-subtle opacity-20" size={48} />
                  <p className="text-brand-ink-muted serif italic text-xl">No feedbacks posted yet.</p>
                  <p className="text-sm text-brand-ink-subtle mt-2">Share your thoughts on recipes you've cooked.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
