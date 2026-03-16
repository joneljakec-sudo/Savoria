/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPreferences, Recipe, Review } from './types';
import Onboarding from './components/Onboarding';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import MyKitchen, { Tab } from './components/MyKitchen';
import CreateRecipeModal from './components/CreateRecipeModal';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { generateRecipes } from './services/geminiService';
import { ChefHat, Search, SlidersHorizontal, LogOut, Sparkles, Loader2, Plus, Menu, X as CloseIcon, Utensils, Heart, MessageSquare, User as UserIcon, Settings, ChevronDown, Check, Moon, Sun } from 'lucide-react';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'my-recipes' | 'favorites' | 'feedbacks' | 'profile';

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string; id: string; avatarColor?: string; avatarUrl?: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [view, setView] = useState<View>('dashboard');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cookedIds, setCookedIds] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        });
        fetchUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        });
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setPreferences(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch preferences
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (profile) {
        if (profile.preferences) {
          setPreferences(profile.preferences);
          // If we have preferences, generate recipes if none exist
          if (recipes.length === 0) {
            setLoading(true);
            try {
              const generated = await generateRecipes(profile.preferences);
              setRecipes(generated);
            } catch (genErr) {
              console.error('Error generating recipes:', genErr);
            } finally {
              setLoading(false);
            }
          }
        }
        
        if (user) {
          setUser({
            ...user,
            name: profile.name || user.name,
            avatarColor: profile.avatar_color || '#5A5A40',
            avatarUrl: profile.avatar_url || ''
          });
        }
      }

      // Fetch favorites
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', userId);
      
      if (favError) {
        console.error('Error fetching favorites:', favError);
      } else if (favData) {
        setFavorites(favData.map(f => f.recipe_id));
      }

      // Fetch user recipes
      const { data: recipeData, error: recipeError } = await supabase
        .from('user_recipes')
        .select('recipe_data')
        .eq('user_id', userId);
      
      if (recipeError) {
        console.error('Error fetching user recipes:', recipeError);
      } else if (recipeData) {
        setUserRecipes(recipeData.map(r => r.recipe_data));
      }

      // Fetch reviews
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (reviewError) {
        console.error('Error fetching reviews:', reviewError);
      } else if (reviewData) {
        const fetchedReviews = reviewData.map(r => ({
          id: r.id,
          recipeId: r.recipe_id,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString()
        }));
        setReviews(fetchedReviews);
        setCookedIds(Array.from(new Set(fetchedReviews.map(r => r.recipeId))));
      }

    } catch (err) {
      console.error('Unexpected error fetching user data:', err);
    }
  };

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setLoading(true);
    
    try {
      // Save to Supabase if user is logged in
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          preferences: prefs,
          updated_at: new Date().toISOString(),
        });
      }

      const generated = await generateRecipes(prefs);
      setRecipes(generated);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeComplete = async (reviewData: Omit<Review, 'id' | 'date'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        recipe_id: reviewData.recipeId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        user_name: user.name
      })
      .select()
      .single();

    if (!error && data) {
      const newReview: Review = {
        id: data.id,
        recipeId: data.recipe_id,
        userName: data.user_name,
        rating: data.rating,
        comment: data.comment,
        date: new Date(data.created_at).toLocaleDateString()
      };
      setReviews([newReview, ...reviews]);
    }

    if (!cookedIds.includes(reviewData.recipeId)) {
      setCookedIds([...cookedIds, reviewData.recipeId]);
    }
    setSelectedRecipe(null);
  };

  const toggleFavorite = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    if (!user) return;

    const isFav = favorites.includes(recipeId);

    if (isFav) {
      // Remove from Supabase
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);
      
      if (!error) {
        setFavorites(prev => prev.filter(id => id !== recipeId));
      }
    } else {
      // Add to Supabase
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          recipe_id: recipeId
        });
      
      if (!error) {
        setFavorites(prev => [...prev, recipeId]);
      }
    }
  };

  const handleSaveUserRecipe = async (newRecipe: Recipe) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_recipes')
      .insert({
        user_id: user.id,
        recipe_data: newRecipe
      });

    if (!error) {
      setUserRecipes([newRecipe, ...userRecipes]);
    }
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!preferences || !user) return;
    
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    setLoading(true);
    
    await supabase.from('profiles').upsert({
      id: user.id,
      preferences: updatedPrefs,
      updated_at: new Date().toISOString(),
    });

    const generated = await generateRecipes(updatedPrefs);
    setRecipes(generated);
    setLoading(false);
  };

  const handleUpdateProfile = async (updates: { name?: string; avatarColor?: string; avatarUrl?: string }) => {
    if (!user) return;
    
    const { error } = await supabase.from('profiles').update({
      name: updates.name,
      avatar_color: updates.avatarColor,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    if (!error) {
      setUser({
        ...user,
        name: updates.name || user.name,
        avatarColor: updates.avatarColor || user.avatarColor,
        avatarUrl: updates.avatarUrl || user.avatarUrl
      });
      setView('dashboard');
    }
  };

  const getRecipeRating = (recipeId: string) => {
    const recipeReviews = reviews.filter(r => r.recipeId === recipeId);
    if (recipeReviews.length === 0) return { average: 0, count: 0 };
    const average = recipeReviews.reduce((acc, r) => acc + r.rating, 0) / recipeReviews.length;
    return { average, count: recipeReviews.length };
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (!preferences) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const filteredRecipes = recipes.filter(r => {
    // Strictly align with user's chosen budget level and diet if filter is 'All'
    const matchesBudget = filter === 'All' ? r.budget === preferences.budget : (r.budget === filter || r.tags.includes(filter));
    const matchesDiet = filter === 'All' ? r.tags.includes(preferences.diet) : true;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBudget && matchesDiet && matchesSearch;
  });

  const allTags = Array.from(new Set(['All', ...recipes.flatMap(r => r.tags), ...recipes.map(r => r.budget)]));

  const favoriteRecipes = [...recipes, ...userRecipes].filter(r => favorites.includes(r.id));
  const cookedRecipes = [...recipes, ...userRecipes].filter(r => cookedIds.includes(r.id));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-recipes', label: 'My Recipes' },
    { id: 'favorites', label: 'Saved Recipes' },
    { id: 'feedbacks', label: 'Feedbacks' },
  ];

  return (
    <div className="min-h-screen bg-brand-cream pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-brand-cream/80 border-b border-black/5 dark:border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="text-brand-olive" size={28} />
            <span className="text-xl font-serif font-bold tracking-tight">Savoria</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-full border-2 border-black/5 dark:border-white/5 hover:border-brand-olive/30 transition-all bg-white dark:bg-brand-cream text-brand-olive shadow-sm"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Avatar - Clickable to go to Profile */}
            <button 
              onClick={() => setView('profile')}
              className="flex items-center gap-3 group hover:opacity-80 transition-all"
              title="View Profile"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-brand-ink uppercase tracking-widest leading-none mb-1 group-hover:text-brand-olive transition-colors">{user.name}</span>
                <span className="text-[9px] text-brand-ink-subtle font-medium leading-none">View Profile</span>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white ring-1 ring-black/5 group-hover:scale-105 transition-transform overflow-hidden"
                style={{ backgroundColor: user.avatarColor || '#5A5A40' }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </button>

            {/* Menu Button (All Screens) */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-black/5 dark:border-white/5 hover:border-brand-olive/30 transition-all font-bold uppercase tracking-widest text-sm bg-white dark:bg-brand-cream shadow-sm"
              >
                <Menu size={18} className="text-brand-olive" />
                <span>Menu</span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 bg-white dark:bg-brand-cream rounded-[32px] shadow-2xl shadow-black/10 dark:shadow-white/5 border border-black/5 dark:border-white/10 overflow-hidden z-50"
                    >
                      <div className="p-4 space-y-2">
                        {/* Quick Preferences Section */}
                        <div className="px-4 py-4 bg-brand-cream/30 dark:bg-white/5 rounded-2xl mb-2">
                          <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-brand-ink-subtle">
                            <Settings size={12} />
                            Quick Preferences
                          </div>
                          
                          <div className="space-y-4">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-ink-subtle">Dark Mode</label>
                              <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-brand-olive' : 'bg-brand-ink/10 dark:bg-white/10'}`}
                              >
                                <motion.div 
                                  animate={{ x: isDarkMode ? 20 : 2 }}
                                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                />
                              </button>
                            </div>

                            {/* Diet Selector */}
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-ink-subtle mb-2">Diet</label>
                              <div className="flex flex-wrap gap-1">
                                {['Keto', 'Vegan', 'Vegetarian', 'High Protein', 'High Carbs'].map(d => (
                                  <button
                                    key={d}
                                    onClick={() => handleUpdatePreferences({ diet: d as any })}
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                                      preferences.diet === d 
                                        ? 'bg-brand-olive text-white' 
                                        : 'bg-white dark:bg-brand-cream text-brand-ink/40 dark:text-brand-ink/60 hover:bg-brand-olive/10'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Budget Selector */}
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-ink-subtle mb-2">Budget</label>
                              <div className="flex gap-1">
                                {['Budget', 'Moderate', 'Premium'].map(b => (
                                  <button
                                    key={b}
                                    onClick={() => handleUpdatePreferences({ budget: b as any })}
                                    className={`flex-1 py-1 rounded-md text-[9px] font-bold transition-all ${
                                      preferences.budget === b 
                                        ? 'bg-brand-olive text-white' 
                                        : 'bg-white dark:bg-brand-cream text-brand-ink/40 dark:text-brand-ink/60 hover:bg-brand-olive/10'
                                    }`}
                                  >
                                    {b === 'Moderate' ? 'Regular' : b}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {navItems.map(item => (
                          <button 
                            key={item.id}
                            onClick={() => {
                              setView(item.id as View);
                              setIsMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
                              view === item.id 
                                ? 'bg-brand-olive text-white shadow-lg shadow-brand-olive/20' 
                                : 'text-brand-ink-muted hover:bg-brand-olive/5 hover:text-brand-ink'
                            }`}
                          >
                            {item.id === 'dashboard' && <Sparkles size={18} />}
                            {item.id === 'my-recipes' && <Utensils size={18} />}
                            {item.id === 'favorites' && <Heart size={18} />}
                            {item.id === 'feedbacks' && <MessageSquare size={18} />}
                            {item.label}
                          </button>
                        ))}
                        <div className="pt-2 mt-2 border-t border-black/5">
                          <button 
                            onClick={async () => {
                              await supabase.auth.signOut();
                              setPreferences(null);
                              setUser(null);
                            }}
                            className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-brand-ink-muted hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <LogOut size={18} />
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Section */}
              <div className="mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2 text-brand-clay font-medium">
                        <Sparkles size={18} />
                        <span>Tailored for your {preferences.diet} lifestyle</span>
                      </div>
                      <div className="flex items-center gap-2 bg-brand-olive/10 text-brand-olive px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        <span>₱ {preferences.budget === 'Moderate' ? 'Regular' : preferences.budget}</span>
                      </div>
                    </div>
                    <h1 className="text-6xl md:text-7xl leading-[0.9] mb-6">
                      What's on the <br />
                      <span className="serif italic">menu today?</span>
                    </h1>

                    {/* Prominent Search Bar */}
                    <div className="max-w-md relative group mt-8">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search size={20} className="text-brand-ink-subtle group-focus-within:text-brand-olive transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search for meals, ingredients, or tags..."
                        className="w-full pl-14 pr-6 py-5 bg-white dark:bg-brand-cream border-2 border-black/5 dark:border-white/5 rounded-[24px] outline-none focus:border-brand-olive/30 shadow-sm transition-all text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pb-2">
                    {allTags.slice(0, 6).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilter(tag)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                          filter === tag 
                            ? 'bg-brand-olive text-white shadow-lg shadow-brand-olive/20' 
                            : 'bg-white dark:bg-brand-cream border border-black/5 dark:border-white/5 hover:border-brand-olive/30'
                        }`}
                      >
                        {tag === 'Moderate' ? 'Regular' : tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recipe Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <Loader2 className="animate-spin text-brand-olive mb-4" size={48} />
                  <p className="text-brand-ink/60 font-serif italic text-xl">Curating your personalized recipes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRecipes.map((recipe, idx) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <RecipeCard 
                        recipe={recipe} 
                        onClick={setSelectedRecipe} 
                        isFavorite={favorites.includes(recipe.id)}
                        onToggleFavorite={(e) => toggleFavorite(e, recipe.id)}
                        rating={getRecipeRating(recipe.id).average}
                        reviewCount={getRecipeRating(recipe.id).count}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredRecipes.length === 0 && (
                <div className="text-center py-32">
                  <p className="text-2xl text-brand-ink-muted serif italic">No recipes found matching your filters.</p>
                  <button onClick={() => setFilter('All')} className="mt-4 text-brand-olive font-medium underline underline-offset-4">
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserProfile 
                profile={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  avatarColor: user.avatarColor || '#5A5A40',
                  avatarUrl: user.avatarUrl || ''
                }}
                onUpdate={handleUpdateProfile}
                onBack={() => setView('dashboard')}
              />
            </motion.div>
          )}

          {view !== 'dashboard' && view !== 'profile' && (
            <motion.div
              key="kitchen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MyKitchen 
                favorites={favoriteRecipes}
                cooked={cookedRecipes}
                userRecipes={userRecipes}
                reviews={reviews}
                onRecipeClick={setSelectedRecipe}
                onPostRecipe={() => setIsCreateModalOpen(true)}
                favoriteIds={favorites}
                onToggleFavorite={toggleFavorite}
                activeTab={view === 'my-recipes' ? 'posts' : view === 'favorites' ? 'favorites' : 'feedbacks'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)}
            onComplete={handleRecipeComplete}
            reviews={reviews}
            isFavorite={favorites.includes(selectedRecipe.id)}
            onToggleFavorite={() => toggleFavorite({ stopPropagation: () => {} } as any, selectedRecipe.id)}
          />
        )}
        {isCreateModalOpen && (
          <CreateRecipeModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveUserRecipe}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
