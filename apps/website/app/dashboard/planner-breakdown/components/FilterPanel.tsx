"use client";

interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function FilterPanel({ searchTerm, onSearchChange }: Props) {
  return (
    <div className="mb-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-2">
            🔍 Search Items
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by item name, spirit, or shop..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
