"use client";

import React from "react";
import { Loader2, Zap, Bot, Command } from "lucide-react";

export type LoadingVariant = "spinner" | "dots" | "pulse" | "bars" | "skeleton" | "bot" | "command" | "minimal";

export type LoadingSize = "sm" | "md" | "lg" | "xl";

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  color?: "blue" | "purple" | "green" | "gray" | "white";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const colorClasses = {
  blue: "text-blue-400",
  purple: "text-purple-400",
  green: "text-green-400",
  gray: "text-gray-400",
  white: "text-white",
};

export default function Loading({
  variant = "spinner",
  size = "md",
  text,
  fullScreen = false,
  className = "",
  color = "blue",
}: LoadingProps) {
  const sizeClass = sizeClasses[size];
  const textSize = textSizes[size];
  const colorClass = colorClasses[color];

  const SpinnerLoader = () => <Loader2 className={`${sizeClass} ${colorClass} animate-spin`} />;

  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${colorClass.replace("text-", "bg-")} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const PulseLoader = () => <div className={`${sizeClass} ${colorClass.replace("text-", "bg-")} rounded-full animate-pulse`} />;

  const BarsLoader = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1 ${colorClass.replace("text-", "bg-")} animate-pulse`}
          style={{
            height: `${12 + (i % 2) * 8}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.8s",
          }}
        />
      ))}
    </div>
  );

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
  );

  const BotLoader = () => (
    <div className="relative">
      <Bot className={`${sizeClass} ${colorClass} animate-bounce`} />
      <div className="absolute -bottom-1 -right-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
      </div>
    </div>
  );

  const CommandLoader = () => (
    <div className="flex items-center space-x-2">
      <Command className={`${sizeClass} ${colorClass} animate-spin`} style={{ animationDuration: "2s" }} />
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-1 h-1 ${colorClass.replace("text-", "bg-")} rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );

  const MinimalLoader = () => (
    <div className={`${sizeClass} border-2 border-gray-600 border-t-${color}-400 rounded-full animate-spin ${className}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return <SpinnerLoader />;
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "bars":
        return <BarsLoader />;
      case "skeleton":
        return <SkeletonLoader />;
      case "bot":
        return <BotLoader />;
      case "command":
        return <CommandLoader />;
      case "minimal":
        return <MinimalLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      {text && <p className={`${textSize} ${colorClass} text-center animate-pulse`}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">{content}</div>
      </div>
    );
  }

  return content;
}

// Convenience components for common use cases
export const PageLoading = ({ text = "Loading page..." }: { text?: string }) => (
  <Loading variant="bot" size="lg" text={text} fullScreen />
);

export const CommandLoading = ({ text = "Processing command..." }: { text?: string }) => (
  <Loading variant="command" size="md" text={text} color="blue" />
);

export const DataLoading = ({ text = "Loading data..." }: { text?: string }) => (
  <Loading variant="spinner" size="md" text={text} color="blue" />
);

export const InlineLoading = ({ size = "sm" }: { size?: LoadingSize }) => <Loading variant="minimal" size={size} color="blue" />;

export const SkeletonLoading = ({ className }: { className?: string }) => <Loading variant="skeleton" className={className} />;
