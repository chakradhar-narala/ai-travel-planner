'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, CloudSun, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative w-full max-w-7xl mx-auto px-6 h-20 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Trao AI
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-white hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all text-slate-900 font-semibold rounded-xl text-sm shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col justify-center items-center px-6 py-12 text-center max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-8 shadow-inner animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Intellectual Travel Orchestration
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white mb-6">
          Explore the world <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            with smart precision.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Trao AI generates tailored, day-by-day itineraries, estimates hyper-realistic budgets, suggests local lodgings, and features our signature <strong>Weather-Aware Packing Assistant</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-20">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            Start Planning Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium rounded-2xl transition-all"
          >
            How it works
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-3xl hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adaptive AI Generation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Day-by-day scheduling driven by Gemini 2.5 Flash, generating tailored activities matching your profile.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-3xl hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <CloudSun className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Weather-Aware Packer</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyzes regional climate during your travel month to generate clothing, document, and gear suggestions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-3xl hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Strict Enclave Isolation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Secure authentication with JWT and bcryptjs. Your saved vacations remain strictly personal.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        <span className="text-slate-500 text-xs font-medium">
          © {new Date().getFullYear()} Trao AI Travel. All rights reserved.
        </span>
        <div className="flex gap-6 text-xs text-slate-400">
          <Link href="/login" className="hover:text-white transition-colors">SignIn</Link>
          <Link href="/register" className="hover:text-white transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}
