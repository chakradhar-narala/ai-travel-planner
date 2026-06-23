import React, { useState } from 'react';
import { X, Loader, Compass, Calendar, DollarSign, Heart } from 'lucide-react';
import { api } from '../utils/api';
import { Trip } from '../types';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (newTrip: Trip) => void;
}

const INTERESTS_OPTIONS = [
  'Food',
  'Culture',
  'Adventure',
  'Relaxation',
  'Shopping',
  'Nature',
  'History',
  'Nightlife',
];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!destination.trim()) {
      setError('Please input a destination.');
      return;
    }

    if (durationDays < 1 || durationDays > 14) {
      setError('Trip duration must be between 1 and 14 days.');
      return;
    }

    setLoading(true);

    try {
      const newTrip = await api.post('/api/trips', {
        destination,
        durationDays,
        budgetTier,
        interests,
      });
      onTripCreated(newTrip);
      // Reset form
      setDestination('');
      setDurationDays(3);
      setBudgetTier('Medium');
      setInterests([]);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden animate-scale-up">
        {/* Border glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-950/40 rounded-xl hover:scale-105 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Generate Dream Trip</h3>
            <p className="text-xs text-slate-400">AI Gemini Orchestration Engine</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Destination</label>
            <input
              type="text"
              placeholder="e.g. Tokyo, Paris, Maui"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-sm rounded-xl px-4 py-3 outline-none transition-all"
              disabled={loading}
            />
          </div>

          {/* Grid for duration and budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Days (1-14)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="Low">Low (Budget)</option>
                <option value="Medium">Medium (Mid-range)</option>
                <option value="High">High (Luxury)</option>
              </select>
            </div>
          </div>

          {/* Interests checklist */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-slate-400" />
              Interests & Themes
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    disabled={loading}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl py-4 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                AI Generator Constructing Itinerary...
              </>
            ) : (
              'Generate Smart Itinerary'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
