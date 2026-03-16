import React from 'react';
import { Recipe } from '../types';
import { Clock, Flame, ChevronRight, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  rating?: number;
  reviewCount?: number;
}

export default function RecipeCard({ recipe, onClick, isFavorite, onToggleFavorite, rating, reviewCount }: RecipeCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="card cursor-pointer group"
      onClick={() => onClick(recipe)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Use a high-quality generic food platter as the ultimate fallback
            target.src = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {rating && rating > 0 && (
            <div className="bg-white/90 dark:bg-brand-cream/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-brand-clay dark:text-brand-clay shadow-sm">
              <Star size={12} fill="currentColor" />
              {rating.toFixed(1)}
              {reviewCount && <span className="text-[10px] opacity-60 ml-0.5">({reviewCount})</span>}
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {onToggleFavorite && (
            <button 
              onClick={onToggleFavorite}
              className={`p-2 rounded-full backdrop-blur transition-colors ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-brand-cream/90 text-brand-ink-subtle hover:text-red-500'}`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          <div className="bg-white/90 dark:bg-brand-cream/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 text-brand-ink">
            <span className="text-brand-olive font-bold">₱</span>
            {recipe.estimatedCost}
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="flex gap-2 mb-4">
          {recipe.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest font-bold text-brand-olive">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-2xl mb-2 group-hover:text-brand-olive transition-colors">{recipe.title}</h3>
        <p className="text-brand-ink-muted text-sm line-clamp-2 mb-6">{recipe.description}</p>
        
        <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-xs text-brand-ink-muted">
              <Clock size={14} />
              {recipe.prepTime}
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-ink-muted">
              <Flame size={14} />
              {recipe.calories} kcal
            </div>
          </div>
          <ChevronRight size={20} className="text-brand-olive opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
        </div>
      </div>
    </motion.div>
  );
}
