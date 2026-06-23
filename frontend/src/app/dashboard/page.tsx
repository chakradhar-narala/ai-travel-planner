'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Trip, Activity } from '../../types';
import { CreateTripModal } from '../../components/CreateTripModal';
import { ItineraryDay } from '../../components/ItineraryDay';
import { PackingList } from '../../components/PackingList';
import { HotelCard } from '../../components/HotelCard';
import {
  Compass,
  LogOut,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Loader,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripsLoading, setTripsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [token, authLoading, router]);

  useEffect(() => {
    if (token) {
      fetchTrips();
    }
  }, [token]);

  const fetchTrips = async () => {
    setTripsLoading(true);
    try {
      const data = await api.get('/api/trips');
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      } else {
        setSelectedTrip(null);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleTripCreated = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setSelectedTrip(newTrip);
  };

  const handleUpdateDay = async (dayNum: number, updatedActivities: Activity[]) => {
    if (!selectedTrip) return;

    // Build new itinerary structure
    const updatedItinerary = selectedTrip.itinerary.map((day) => {
      if (day.dayNumber === dayNum) {
        return { ...day, activities: updatedActivities };
      }
      return day;
    });

    // Update estimated budget in the frontend first (re-calculate activities costs)
    const activitiesCost = updatedItinerary.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, act) => dayTotal + (act.estimatedCostUSD || 0), 0);
    }, 0);

    const estimatedBudget = {
      ...selectedTrip.estimatedBudget,
      activities: activitiesCost,
      total:
        selectedTrip.estimatedBudget.transport +
        selectedTrip.estimatedBudget.accommodation +
        selectedTrip.estimatedBudget.food +
        activitiesCost,
    };

    try {
      const updatedTrip = await api.put(`/api/trips/${selectedTrip._id}`, {
        itinerary: updatedItinerary,
        estimatedBudget,
      });

      // Update states
      setTrips(trips.map((t) => (t._id === selectedTrip._id ? updatedTrip : t)));
      setSelectedTrip(updatedTrip);
    } catch (err) {
      console.error('Failed to update itinerary:', err);
    }
  };

  const handleRegenerateDay = async (dayNum: number, feedbackPrompt: string) => {
    if (!selectedTrip) return;

    try {
      const updatedTrip = await api.post(`/api/trips/${selectedTrip._id}/regenerate-day`, {
        dayNumber: dayNum,
        prompt: feedbackPrompt,
      });

      setTrips(trips.map((t) => (t._id === selectedTrip._id ? updatedTrip : t)));
      setSelectedTrip(updatedTrip);
    } catch (err) {
      console.error('Failed to regenerate itinerary day:', err);
      throw err;
    }
  };

  const handleTogglePackingItem = async (itemId: string) => {
    if (!selectedTrip) return;

    const updatedPacking = selectedTrip.packingList.map((item) => {
      if (item._id === itemId) {
        return { ...item, isPacked: !item.isPacked };
      }
      return item;
    });

    try {
      const updatedTrip = await api.put(`/api/trips/${selectedTrip._id}`, {
        packingList: updatedPacking,
      });

      setTrips(trips.map((t) => (t._id === selectedTrip._id ? updatedTrip : t)));
      setSelectedTrip(updatedTrip);
    } catch (err) {
      console.error('Failed to toggle packing item:', err);
    }
  };

  const handleDeleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;

    setDeleteLoadingId(tripId);
    try {
      await api.delete(`/api/trips/${tripId}`);
      
      const remainingTrips = trips.filter((t) => t._id !== tripId);
      setTrips(remainingTrips);

      if (selectedTrip?._id === tripId) {
        setSelectedTrip(remainingTrips.length > 0 ? remainingTrips[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-950 text-slate-100">
        <Loader className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          Opening secure user chamber...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-indigo-600/10">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
                AI Travel Dashboard
              </h1>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Vault Isolated Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transitio[...]
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Left Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Trips Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col max-h-[480px]">
            <div className="flex justify-between items-center mb-5 flex-shrink-0">
              <div>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Your vacations</h3>
                <p className="text-[10px] text-slate-500">Stored inside private data vault</p>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
                title="Create new itinerary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {tripsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <p className="text-xs">No active travel itineraries found.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Generate one to start
                  </button>
                </div>
              ) : (
                trips.map((trip) => {
                  const isSelected = selectedTrip?._id === trip._id;
                  return (
                    <div
                      key={trip._id}
                      onClick={() => setSelectedTrip(trip)}
                      className={`group flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden pr-2">
                        <p className="text-sm font-bold truncate">{trip.destination}</p>
                        <div className="flex items-center gap-2 text-[10px] opacity-80">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {trip.durationDays} days
                          </span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-indigo-400">{trip.budgetTier} Budget</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteTrip(trip._id, e)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-slate-950 hover:bg-slate-850 hover:text-red-400 text-slate-500 transition-all border border-slate-850"
                        title="Delete itinerary"
                        disabled={deleteLoadingId === trip._id}
                      >
                        {deleteLoadingId === trip._id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Budget Ledger Card */}
          {selectedTrip && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Financial Ledger</h3>
                <p className="text-[10px] text-slate-500">Estimates dynamically adjusted on customization</p>
              </div>

              <div className="space-y-3 text-xs bg-slate-950/60 border border-slate-850 rounded-2xl p-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lodging & Accommodations:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.accommodation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Activities & Curation:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.activities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit & Transport:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.transport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Culinary & Dining:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.food}</span>
                </div>

                <div className="border-t border-slate-900 pt-3 flex justify-between text-sm font-extrabold text-white">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Grand Total Est:
                  </span>
                  <span className="text-emerald-400 font-mono">${selectedTrip.estimatedBudget.total}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Itinerary Timeline Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedTrip ? (
            <>
              {/* Trip Metadata Header */}
              <div className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relati[...]
                {/* Highlight glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Active Destination</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                    {selectedTrip.destination}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedTrip.interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-[9px] font-semibold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 border border-slate-900 p-3 rounded-2xl text-center min-w-16">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Duration</p>
                    <p className="text-lg font-bold text-white font-mono">{selectedTrip.durationDays}d</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 p-3 rounded-2xl text-center min-w-16">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Tier</p>
                    <p className="text-sm font-extrabold text-indigo-400 uppercase leading-relaxed">{selectedTrip.budgetTier}</p>
                  </div>
                </div>
              </div>

              {/* Hotels */}
              <HotelCard hotels={selectedTrip.hotels || []} />

              {/* Weather Packing Assistant */}
              <PackingList items={selectedTrip.packingList || []} onToggleItem={handleTogglePackingItem} />

              {/* Day-by-Day Timeline Title */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Day-by-Day Timeline</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Custom updates persistent in cloud</span>
                </div>
                
                {selectedTrip.itinerary.map((day) => (
                  <ItineraryDay
                    key={day.dayNumber}
                    day={day}
                    onUpdateDay={handleUpdateDay}
                    onRegenerateDay={handleRegenerateDay}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
              <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 animate-bounce">
                <Compass className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No trip selected</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                  Select an active vacation planner from the left panel, or generate a brand new customized vacation timeline right now!
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600[...]
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Trip
              </button>
            </div>
          )}

        </div>

      </main>

      {/* Slide-in Modal */}
      <CreateTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTripCreated={handleTripCreated}
      />

    </div>
  );
}
