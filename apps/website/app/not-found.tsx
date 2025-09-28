import Link from "next/link";
import { Home, Search, Star } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text animate-pulse">
              404
            </h1>
          </div>

          <div className="mb-8 space-y-4">
            <h2 className="text-3xl font-bold text-white mb-4">Lost in the Wind Paths? ☁️</h2>
            <div className="text-xl text-slate-300 space-y-2">
              <p>Looks like this page has drifted away like a fallen star.</p>
              <p className="text-lg text-slate-400">Even the spirits couldn&apos;t guide us to this realm...</p>
            </div>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-300">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm">The realm you seek does not exist</span>
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:scale-105"
            >
              <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Return Home
            </Link>

            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200 shadow-lg hover:shadow-slate-500/20"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Find Your Servers
            </Link>
          </div>

          <div className="mt-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <blockquote className="text-slate-300 italic">
              "Like children of the light, we must find our way back to where we belong..."
            </blockquote>
            <p className="text-slate-500 text-sm mt-2">— Lost Sky Child</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-2">Need help navigating SkyHelper?</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Link href="/commands" className="text-blue-400 hover:text-blue-300 transition-colors">
                Commands
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
                Dashboard
              </Link>

              <span className="text-slate-600">•</span>
              <a
                href="https://discord.com/invite/2rjCRKZsBb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
