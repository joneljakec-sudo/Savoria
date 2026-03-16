import React, { useState } from 'react';
import { Recipe, Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Flame, Utensils, CheckCircle2, Star, ChevronRight, ChevronLeft, Play, Heart } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onComplete: (review: Omit<Review, 'id' | 'date'>) => void;
  reviews?: Review[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

type DetailView = 'overview' | 'cooking' | 'feedback';

export default function RecipeDetail({ 
  recipe, 
  onClose, 
  onComplete, 
  reviews = [],
  isFavorite = false,
  onToggleFavorite
}: RecipeDetailProps) {
  const [view, setView] = useState<DetailView>('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const recipeReviews = reviews.filter(r => r.recipeId === recipe.id);
  const averageRating = recipeReviews.length > 0 
    ? recipeReviews.reduce((acc, r) => acc + r.rating, 0) / recipeReviews.length 
    : 0;

  const handleFinish = () => {
    onComplete({
      recipeId: recipe.id,
      userName: 'You',
      rating,
      comment
    });
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setView('feedback');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setView('overview');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-cream dark:bg-brand-ink w-full max-w-5xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
          <motion.img 
            key={view === 'cooking' ? `step-${currentStep}` : 'main'}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 bg-white/90 dark:bg-brand-cream/90 backdrop-blur p-3 rounded-full hover:bg-white dark:hover:bg-brand-cream transition-colors shadow-lg text-brand-ink"
          >
            <X size={20} />
          </button>
          
          {view === 'cooking' && recipe.instructions.length > 0 && (
            <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / Math.max(1, recipe.instructions.length)) * 100}%` }}
                  />
                </div>
                <span className="text-white font-bold text-sm">
                  {currentStep + 1} / {recipe.instructions.length}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="md:w-1/2 p-12 overflow-y-auto bg-white/50 dark:bg-brand-cream/50">
          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {recipe.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-brand-olive/10 text-brand-olive text-[10px] uppercase tracking-widest font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1.5 bg-brand-clay/10 text-brand-clay px-3 py-1 rounded-full">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold">{averageRating.toFixed(1)}</span>
                      <span className="text-[10px] opacity-60">({recipeReviews.length})</span>
                    </div>
                  )}
                </div>
                <h2 className="text-5xl mb-6 font-serif leading-tight">{recipe.title}</h2>
                <p className="text-brand-ink-muted text-lg mb-8 leading-relaxed">{recipe.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="bg-white dark:bg-brand-cream/40 p-4 rounded-2xl text-center shadow-sm">
                    <Clock className="mx-auto mb-2 text-brand-olive" size={20} />
                    <div className="text-[10px] font-bold uppercase text-brand-ink-subtle tracking-wider">Time</div>
                    <div className="font-semibold">{recipe.prepTime}</div>
                  </div>
                  <div className="bg-white dark:bg-brand-cream/40 p-4 rounded-2xl text-center shadow-sm">
                    <Flame className="mx-auto mb-2 text-brand-olive" size={20} />
                    <div className="text-[10px] font-bold uppercase text-brand-ink-subtle tracking-wider">Calories</div>
                    <div className="font-semibold">{recipe.calories}</div>
                  </div>
                  <div className="bg-white dark:bg-brand-cream/40 p-4 rounded-2xl text-center shadow-sm">
                    <Utensils className="mx-auto mb-2 text-brand-olive" size={20} />
                    <div className="text-[10px] font-bold uppercase text-brand-ink-subtle tracking-wider">Difficulty</div>
                    <div className="font-semibold">{recipe.difficulty}</div>
                  </div>
                  <div className="bg-white dark:bg-brand-cream/40 p-4 rounded-2xl text-center shadow-sm">
                    <div className="text-brand-olive font-bold text-xl mb-1">₱</div>
                    <div className="text-[10px] font-bold uppercase text-brand-ink-subtle tracking-wider">Est. Cost</div>
                    <div className="font-semibold">{recipe.estimatedCost}</div>
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="text-2xl mb-6 serif italic">Nutritional Facts</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-brand-olive/5 p-4 rounded-2xl border border-brand-olive/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-olive mb-1">Protein</div>
                      <div className="text-2xl font-bold text-brand-olive">{recipe.nutrients.protein}</div>
                      <div className="h-1 w-full bg-brand-olive/10 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          className="h-full bg-brand-olive"
                        />
                      </div>
                    </div>
                    <div className="bg-brand-clay/5 p-4 rounded-2xl border border-brand-clay/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-clay mb-1">Carbs</div>
                      <div className="text-2xl font-bold text-brand-clay">{recipe.nutrients.carbs}</div>
                      <div className="h-1 w-full bg-brand-clay/10 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '45%' }}
                          className="h-full bg-brand-clay"
                        />
                      </div>
                    </div>
                    <div className="bg-brand-ink/5 p-4 rounded-2xl border border-brand-ink/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-ink-muted mb-1">Fat</div>
                      <div className="text-2xl font-bold text-brand-ink">{recipe.nutrients.fat}</div>
                      <div className="h-1 w-full bg-brand-ink/10 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '30%' }}
                          className="h-full bg-brand-ink"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="text-2xl mb-6 serif italic">Ingredients</h4>
                  <ul className="grid grid-cols-1 gap-3">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-3 text-brand-ink/80 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                        <div className="w-2 h-2 rounded-full bg-brand-olive" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {recipeReviews.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl serif italic">Recent Reviews</h4>
                      <div className="flex items-center gap-1 text-brand-clay">
                        <Star size={16} fill="currentColor" />
                        <span className="font-bold">{averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {recipeReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-sm">{review.userName}</div>
                              <div className="text-[10px] text-brand-ink-subtle uppercase tracking-widest">{review.date}</div>
                            </div>
                            <div className="flex gap-0.5 text-brand-clay">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-brand-ink-muted italic leading-relaxed">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setView('cooking')}
                    className="btn-primary flex-1 py-5 text-lg flex items-center justify-center gap-3"
                  >
                    <Play size={20} fill="currentColor" />
                    Start Cooking
                  </button>
                  
                  {onToggleFavorite && (
                    <button 
                      onClick={onToggleFavorite}
                      className={`px-8 py-5 rounded-full border-2 transition-all flex items-center justify-center gap-2 font-bold ${
                        isFavorite 
                          ? 'bg-red-50 border-red-100 text-red-500' 
                          : 'border-black/5 dark:border-white/5 text-brand-ink-subtle hover:border-brand-olive/30 hover:text-brand-olive'
                      }`}
                    >
                      <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'cooking' && (
              <motion.div 
                key="cooking"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-serif">Step {currentStep + 1}</h2>
                  <div className="px-4 py-2 bg-brand-olive/10 text-brand-olive rounded-full text-sm font-bold">
                    {recipe.instructions.length > 0 ? Math.round(((currentStep + 1) / recipe.instructions.length) * 100) : 0}% Complete
                  </div>
                </div>

                  <div className="flex-grow flex items-center justify-center mb-12">
                    <motion.div 
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center max-w-lg"
                    >
                      <p className="text-3xl leading-snug text-brand-ink font-medium">
                        {recipe.instructions[currentStep]}
                      </p>
                    </motion.div>
                  </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button 
                    onClick={prevStep}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-black/5 hover:bg-black/5 transition-all font-bold"
                  >
                    <ChevronLeft size={20} />
                    {currentStep === 0 ? 'Overview' : 'Previous'}
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-olive text-white font-bold shadow-lg shadow-brand-olive/20 hover:bg-brand-olive/90 transition-all"
                  >
                    {currentStep === recipe.instructions.length - 1 ? 'Finish Cooking' : 'Next Step'}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'feedback' && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-brand-olive" size={40} />
                  </div>
                  <h2 className="text-4xl font-serif mb-4">Delicious!</h2>
                  <p className="text-brand-ink-muted">How did your {recipe.title} turn out?</p>
                </div>

                <div className="space-y-8">
                  <div className="text-center">
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-ink-subtle mb-4">Rate your experience</label>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setRating(s)}
                          className={`p-2 transition-all transform hover:scale-110 ${rating >= s ? 'text-brand-clay' : 'text-black/10'}`}
                        >
                          <Star fill={rating >= s ? 'currentColor' : 'none'} size={48} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-ink-subtle mb-4">Share your thoughts</label>
                    <textarea 
                      placeholder="Was it easy? Any tips for others?"
                      className="w-full p-6 bg-white dark:bg-brand-cream border-2 border-black/5 dark:border-white/5 rounded-[24px] outline-none min-h-[150px] transition-all text-brand-ink"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={handleFinish}
                    className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3"
                  >
                    Save Review & Return
                  </button>
                  
                  <button 
                    onClick={() => setView('cooking')}
                    className="w-full text-center text-sm font-bold text-brand-ink-subtle hover:text-brand-ink transition-colors"
                  >
                    Back to Instructions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
