"use client";

import { useState, useEffect } from "react";
import Modal from "./ui/Modal";

interface FeatureImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface FeatureModalProps {
  images: FeatureImage[];
  icon: string;
}

export default function FeatureModal({ images, icon }: FeatureModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="relative bg-slate-900  flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
        {images.length > 0 ? (
          <>
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <div className="w-full  max-w-md aspect-video bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-slate-700">
                <img src={images[currentImageIndex].url} />
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? "bg-blue-500 w-6" : "bg-slate-600 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{icon}</span>
            </div>
            <p className="text-slate-400">No images available for this feature</p>
          </div>
        )}
      </div>

      <div className="p-8 lg:p-12 flex flex-col justify-center">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">{icon}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{images[currentImageIndex].title}</h2>
        </div>

        <p className="text-slate-300 text-lg leading-relaxed mb-8">{images[currentImageIndex].description}</p>

        {images.length > 1 && (
          <div>
            <h3 className="text-white font-semibold mb-4">Screenshots ({images.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 flex items-center justify-center">
                    <img src={image.url} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
