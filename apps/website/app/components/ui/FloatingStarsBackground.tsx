"use client";

import { Star, Sparkles } from "lucide-react";

export default function FloatingStarsBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/6 left-1/5 text-blue-400/10 animate-pulse">
        <Star className="w-6 h-6" fill="currentColor" />
      </div>
      <div className="absolute top-1/4 right-1/6 text-purple-400/10 animate-pulse delay-700">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-1/3 left-2/3 text-cyan-400/10 animate-pulse delay-1000">
        <Star className="w-5 h-5" fill="currentColor" />
      </div>
      <div className="absolute top-2/5 right-1/4 text-indigo-400/10 animate-pulse delay-500">
        <Star className="w-4 h-4" fill="currentColor" />
      </div>

      <div className="absolute top-3/5 left-1/4 text-blue-300/8 animate-pulse delay-300">
        <Star className="w-3 h-3" fill="currentColor" />
      </div>
      <div className="absolute bottom-1/3 right-1/3 text-purple-300/8 animate-pulse delay-900">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="absolute top-1/2 left-1/6 text-cyan-300/8 animate-pulse delay-1200">
        <Star className="w-4 h-4" fill="currentColor" />
      </div>
      <div className="absolute bottom-1/4 left-2/3 text-indigo-300/8 animate-pulse delay-600">
        <Star className="w-5 h-5" fill="currentColor" />
      </div>

      <div className="absolute top-1/5 right-2/5 text-blue-200/6 animate-pulse delay-400">
        <Star className="w-2 h-2" fill="currentColor" />
      </div>
      <div className="absolute bottom-2/5 left-1/3 text-purple-200/6 animate-pulse delay-800">
        <Star className="w-3 h-3" fill="currentColor" />
      </div>
      <div className="absolute top-4/5 right-1/5 text-cyan-200/6 animate-pulse delay-1100">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="absolute bottom-1/5 right-2/3 text-indigo-200/6 animate-pulse delay-200">
        <Star className="w-2 h-2" fill="currentColor" />
      </div>

      <div className="absolute top-3/4 left-1/5 text-blue-100/4 animate-pulse delay-1300">
        <Star className="w-1.5 h-1.5" fill="currentColor" />
      </div>
      <div className="absolute top-1/8 left-3/4 text-purple-100/4 animate-pulse delay-150">
        <Star className="w-2 h-2" fill="currentColor" />
      </div>
      <div className="absolute bottom-1/6 left-1/2 text-cyan-100/4 animate-pulse delay-950">
        <Star className="w-1.5 h-1.5" fill="currentColor" />
      </div>
    </div>
  );
}
