import React, { useState } from 'react';
import { Trash2, Plus, Sparkles, Loader } from 'lucide-react';
import { Activity, ItineraryDay as IItineraryDay } from '../types';

interface ItineraryDayProps {
  day: IItineraryDay;
  tripId: string;
  onUpdateDay: (dayNum: number, updatedActivities: Activity[]) => Promise<void>;
  onRegenerateDay: (dayNum: number, feedbackPrompt: string) => Promise<void>;
}

export const ItineraryDay: React.FC<ItineraryDayProps> = ({
  day,
  tripId: _tripId,
  onUpdateDay,
  onRegenerateDay,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState<number>(0);
  const [newTime, setNewTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Afternoon');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newActivity: Activity = {
      title: newTitle.trim(),
      description: newDesc.trim() || 'Added by traveler',
      estimatedCostUSD: newCost,
      timeOfDay: newTime,
    };

    const updatedActivities = [...day.activities, newActivity];
    await onUpdateDay(day.dayNumber, updatedActivities);

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewCost(0);
    setNewTime('Afternoon');
    setShowAddForm(false);
  };

  const handleDeleteActivity = async (index: number) => {
    const updatedActivities = day.activities.filter((_, idx) => idx !== index);
    await onUpdateDay(day.dayNumber, updatedActivities);
  };

  const handleRegenerate = async () => {
    if (!aiFeedback.trim()) return;
    setAiLoading(true);
    try {
      await onRegenerateDay(day.dayNumber, aiFeedback);
      setAiFeedback('');
      setShowAiForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative">
      {/* Day header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-xl font-bold text-white">Day {day.dayNumber}</h3>
          <p className="text-xs text-slate-400">Total activities: {day.activities.length}</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowAiForm(false);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 transition-all border border-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
          
          <button
            onClick={() => {
              setShowAiForm(!showAiForm);
              setShowAddForm(false);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 transition-all border border-indigo-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Regenerate Day
          </button>
        </div>
      </div>

      {/* AI Regeneration Form */}
      {showAiForm && (
        <div className="mb-6 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-600/5 space-y-3">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
            💡 AI Instruction for Day {day.dayNumber}
          </label>
          <p className="text-[11px] text-slate-400">
            Tell the AI agent what to customize for this day (e.g. &quot;Focus on historic temples and local sushi joints&quot;).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Change to relaxing spa and beach activities..."
              value={aiFeedback}
              onChange={(e) => setAiFeedback(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-xs rounded-xl px-3 py-2.5 outline-none transition-all"
              disabled={aiLoading}
            />
            <button
              onClick={handleRegenerate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1"
              disabled={aiLoading || !aiFeedback.trim()}
            >
              {aiLoading ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Activity Form */}
      {showAddForm && (
        <form onSubmit={handleAddActivity} className="mb-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
              <input
                type="text"
                placeholder="Visit Asakusa temple"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-xs rounded-lg px-3 py-2 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Short Description</label>
              <input
                type="text"
                placeholder="Buy local snacks"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-100 placeholder-slate-600 text-xs rounded-lg px-3 py-2 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cost (USD)</label>
              <input
                type="number"
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Time of Day</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value as 'Morning' | 'Afternoon' | 'Evening')}
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-100 text-xs rounded-lg px-3 py-2 outline-none transition-all cursor-pointer"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg py-2.5 transition-all shadow-md shadow-blue-600/20"
              >
                Add Activity
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Activity Timeline List */}
      <div className="relative border-l border-slate-800 ml-3.5 pl-6 space-y-6">
        {day.activities.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No activities planned. Use &quot;Add Activity&quot; above to get started!</p>
        ) : (
          day.activities.map((act, index) => (
            <div key={index} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-indigo-500 shadow-lg shadow-indigo-500/25" />

              <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 hover:border-slate-850 hover:bg-slate-900/50 transition-all flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white leading-tight">{act.title}</h4>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {act.timeOfDay}
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                  )}
                  {act.estimatedCostUSD > 0 && (
                    <p className="text-xs text-emerald-400 font-semibold font-mono">
                      Cost: ${act.estimatedCostUSD}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteActivity(index)}
                  className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-950 hover:bg-slate-800 rounded-lg hover:scale-105 transition-all flex-shrink-0"
                  title="Remove activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
