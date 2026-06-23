import React from 'react';
import { Hotel } from '../types';
import { Star } from 'lucide-react';

interface HotelCardProps {
  hotels: Hotel[];
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotels }) => {
  const getBadgeColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'luxury':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'mid-range':
      case 'medium':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
      <div className="border-b border-slate-800 pb-4 mb-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🏨 AI Lodging Recommendations
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Hotel curation aligned with destination ratings and budget tier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotels.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 col-span-3 text-center">No hotel recommendations found.</p>
        ) : (
          hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-slate-950/40 border border-slate-850 hover:border-slate-850 hover:bg-slate-900/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white leading-snug">{hotel.name}</h4>
                  {hotel.rating && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded-full font-bold border border-amber-400/10 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {hotel.rating}
                    </div>
                  )}
                </div>

                {hotel.tier && (
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${getBadgeColor(hotel.tier)}`}>
                    {hotel.tier}
                  </span>
                )}
              </div>

              {hotel.estimatedCostNightUSD && hotel.estimatedCostNightUSD > 0 ? (
                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Est. Price</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-sm">
                    ${hotel.estimatedCostNightUSD} <span className="text-[10px] text-slate-500 font-medium">/ night</span>
                  </span>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500">
                  Rate queries pending local season
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
