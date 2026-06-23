import React from 'react';
import { Square, CheckSquare, Briefcase, FileText, Shirt, Compass } from 'lucide-react';
import { PackingItem } from '../types';

interface PackingListProps {
  items: PackingItem[];
  onToggleItem: (itemId: string) => Promise<void>;
}

export const PackingList: React.FC<PackingListProps> = ({ items, onToggleItem }) => {
  const totalItems = items.length;
  const packedItems = items.filter((i) => i.isPacked).length;
  const percentPacked = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Group items by category
  const categories: Record<'Documents' | 'Clothing' | 'Gear' | 'Other', PackingItem[]> = {
    Documents: [],
    Clothing: [],
    Gear: [],
    Other: [],
  };

  items.forEach((item) => {
    if (categories[item.category]) {
      categories[item.category].push(item);
    } else {
      categories.Other.push(item);
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documents':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'Clothing':
        return <Shirt className="w-4 h-4 text-indigo-400" />;
      case 'Gear':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
      
      {/* Title & Description */}
      <div className="border-b border-slate-800 pb-4 mb-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          ⛈️ Smart Climate packing Assistant
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Cross-references destination weather to build a tailored activity packing list.
        </p>
      </div>

      {/* Progress Card */}
      {totalItems > 0 ? (
        <div className="mb-6 bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-400">Items packed</span>
            <span className="text-white">{packedItems} of {totalItems} ({percentPacked}%)</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentPacked}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 text-center py-4">
          No packing items found. Itineraries auto-generate checklist assets on creation.
        </div>
      )}

      {/* Lists by category */}
      <div className="space-y-6">
        {(Object.keys(categories) as Array<'Documents' | 'Clothing' | 'Gear' | 'Other'>).map((catKey) => {
          const list = categories[catKey];
          if (list.length === 0) return null;

          return (
            <div key={catKey} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-1.5">
                {getCategoryIcon(catKey)}
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{catKey}</h4>
                <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono ml-auto">
                  {list.filter((i) => i.isPacked).length}/{list.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {list.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => onToggleItem(item._id!)}
                    className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/40 rounded-xl transition-all text-left"
                  >
                    {item.isPacked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
