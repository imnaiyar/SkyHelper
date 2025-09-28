import React from "react";

interface FeatureImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  forwardDescription?: React.ReactNode;
  features: string[];
  images?: FeatureImage[];
}

export default function FeatureCard({ icon, title, description, features, images, forwardDescription }: FeatureCardProps) {
  return (
    <div className="group relative cursor-pointer">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>

      <div className="relative bg-slate-800 p-6 rounded-2xl border border-slate-700 group-hover:border-slate-600 transition-all duration-300 h-full transform group-hover:scale-[1.02]">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-2xl">{icon}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
          {title}
        </h3>

        <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-slate-400">
              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-2">
            {((images && images.length > 0) || forwardDescription) && (
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                {forwardDescription ?? `${images?.length} screenshots`}
              </span>
            )}
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
