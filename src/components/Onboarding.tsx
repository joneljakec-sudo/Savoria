import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPreferences, DietPreference, BudgetLevel } from '../types';
import { ChefHat, Leaf, Flame, Utensils } from 'lucide-react';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const DIETS: DietPreference[] = ['Keto', 'Vegan', 'Vegetarian', 'High Protein', 'High Carbs'];
const BUDGETS: BudgetLevel[] = ['Budget', 'Moderate', 'Premium'];
const CUISINES = ['Filipino', 'Italian', 'Mexican', 'Japanese', 'Indian', 'Mediterranean', 'Thai', 'American', 'French'];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    diet: 'Keto',
    allergies: [],
    budget: 'Budget',
    cuisines: []
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleCuisine = (c: string) => {
    setPrefs(p => ({
      ...p,
      cuisines: p.cuisines.includes(c) 
        ? p.cuisines.filter(x => x !== c) 
        : [...p.cuisines, c]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-cream dark:bg-brand-ink transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full card p-12"
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <ChefHat className="text-brand-olive" size={32} />
            <span className="text-2xl font-serif font-semibold">Savoria</span>
          </div>
          <span className="text-sm font-medium text-brand-olive/60">Step {step} of 3</span>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl mb-4">What's your dietary style?</h2>
            <p className="text-brand-ink/60 mb-8">We'll tailor your recommendations based on how you like to eat.</p>
            <div className="grid grid-cols-2 gap-4 mb-12">
              {DIETS.map(diet => (
                <button
                  key={diet}
                  onClick={() => setPrefs({ ...prefs, diet })}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    prefs.diet === diet 
                      ? 'border-brand-olive bg-brand-olive/5 dark:bg-brand-olive/20 text-brand-olive' 
                      : 'border-black/5 dark:border-white/5 hover:border-brand-olive/30'
                  }`}
                >
                  <div className="font-semibold">{diet}</div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="btn-primary w-full">Continue</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl mb-4">Set your budget & cuisines</h2>
            <p className="text-brand-ink/60 mb-8">Tell us what you're craving and how much you'd like to spend.</p>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Budget Level (PHP)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    onClick={() => setPrefs({ ...prefs, budget: b })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      prefs.budget === b 
                        ? 'border-brand-olive bg-brand-olive/5 dark:bg-brand-olive/20 text-brand-olive' 
                        : 'border-black/5 dark:border-white/5 hover:border-brand-olive/30'
                    }`}
                  >
                    <div className="font-bold">{b === 'Moderate' ? 'Regular' : b}</div>
                    <div className="text-[10px] opacity-60 mt-1">
                      {b === 'Budget' && '₱50 - ₱80'}
                      {b === 'Moderate' && '₱100 - ₱130'}
                      {b === 'Premium' && '₱250 - ₱350'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <label className="block text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Favorite Cuisines</label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      prefs.cuisines.includes(c)
                        ? 'bg-brand-olive text-white border-brand-olive'
                        : 'border-black/10 dark:border-white/10 hover:border-brand-olive/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-secondary flex-1">Back</button>
              <button onClick={nextStep} className="btn-primary flex-1">Next</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl mb-4">Any allergies or restrictions?</h2>
            <p className="text-brand-ink/60 mb-8">Safety first. We'll make sure to exclude these from your recipes.</p>
            
            <textarea
              placeholder="e.g. Peanuts, Shellfish, Dairy (comma separated)"
              className="w-full p-6 rounded-2xl outline-none min-h-[150px] mb-12 bg-white dark:bg-white/5 border-2 border-black/5 dark:border-white/10 focus:border-brand-olive/30 transition-all font-medium"
              onChange={(e) => setPrefs({ ...prefs, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />

            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-secondary flex-1">Back</button>
              <button onClick={() => onComplete(prefs)} className="btn-primary flex-1">Find Recipes</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
