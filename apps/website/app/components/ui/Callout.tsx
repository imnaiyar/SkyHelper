"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Lightbulb,
  Zap,
  Star,
  Heart,
  Shield,
  Clock,
  ChevronDown,
} from "lucide-react";

export type CalloutType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "tip"
  | "important"
  | "note"
  | "feature"
  | "premium"
  | "security"
  | "time";

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const calloutConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
    textColor: "text-blue-800 dark:text-blue-200",
    defaultTitle: "Information",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-900 dark:text-green-100",
    textColor: "text-green-800 dark:text-green-200",
    defaultTitle: "Success",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-900 dark:text-yellow-100",
    textColor: "text-yellow-800 dark:text-yellow-200",
    defaultTitle: "Warning",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
    textColor: "text-red-800 dark:text-red-200",
    defaultTitle: "Error",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-900 dark:text-amber-100",
    textColor: "text-amber-800 dark:text-amber-200",
    defaultTitle: "Tip",
  },
  important: {
    icon: Star,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-900 dark:text-purple-100",
    textColor: "text-purple-800 dark:text-purple-200",
    defaultTitle: "Important",
  },
  note: {
    icon: Info,
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-700",
    iconColor: "text-slate-600 dark:text-slate-400",
    titleColor: "text-slate-900 dark:text-slate-100",
    textColor: "text-slate-800 dark:text-slate-200",
    defaultTitle: "Note",
  },
  feature: {
    icon: Zap,
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    titleColor: "text-indigo-900 dark:text-indigo-100",
    textColor: "text-indigo-800 dark:text-indigo-200",
    defaultTitle: "Feature",
  },
  premium: {
    icon: Heart,
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
    iconColor: "text-pink-600 dark:text-pink-400",
    titleColor: "text-pink-900 dark:text-pink-100",
    textColor: "text-pink-800 dark:text-pink-200",
    defaultTitle: "Premium",
  },
  security: {
    icon: Shield,
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    titleColor: "text-orange-900 dark:text-orange-100",
    textColor: "text-orange-800 dark:text-orange-200",
    defaultTitle: "Security",
  },
  time: {
    icon: Clock,
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800",
    iconColor: "text-teal-600 dark:text-teal-400",
    titleColor: "text-teal-900 dark:text-teal-100",
    textColor: "text-teal-800 dark:text-teal-200",
    defaultTitle: "Time Sensitive",
  },
} as const;

export function Callout({ type, title, children, className = "", collapsible = false, defaultExpanded = true }: CalloutProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={`
        border-l-4 rounded-r-lg overflow-hidden
        ${config.bgColor} 
        ${config.borderColor} 
        ${className}
      `}
    >
      <div
        className={`
          flex items-center gap-3 p-4 
          ${collapsible ? "cursor-pointer select-none" : ""}
          ${collapsible ? "hover:opacity-80 transition-opacity" : ""}
        `}
        onClick={toggleExpanded}
      >
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
        <h4 className={`font-semibold ${config.titleColor} flex-1`}>{displayTitle}</h4>
        {collapsible && (
          <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            <ChevronDown className={`w-4 h-4 ${config.iconColor}`} />
          </div>
        )}
      </div>

      {(!collapsible || isExpanded) && (
        <div className={`px-4 pb-4 ${config.textColor}`}>
          <div className="prose prose-sm max-w-none dark:prose-invert">{children}</div>
        </div>
      )}
    </div>
  );
}

// Convenience components for specific types
export const InfoCallout = (props: Omit<CalloutProps, "type">) => <Callout type="info" {...props} />;

export const SuccessCallout = (props: Omit<CalloutProps, "type">) => <Callout type="success" {...props} />;

export const WarningCallout = (props: Omit<CalloutProps, "type">) => <Callout type="warning" {...props} />;

export const ErrorCallout = (props: Omit<CalloutProps, "type">) => <Callout type="error" {...props} />;

export const TipCallout = (props: Omit<CalloutProps, "type">) => <Callout type="tip" {...props} />;

export const ImportantCallout = (props: Omit<CalloutProps, "type">) => <Callout type="important" {...props} />;

export const NoteCallout = (props: Omit<CalloutProps, "type">) => <Callout type="note" {...props} />;

export const FeatureCallout = (props: Omit<CalloutProps, "type">) => <Callout type="feature" {...props} />;

export const PremiumCallout = (props: Omit<CalloutProps, "type">) => <Callout type="premium" {...props} />;

export const SecurityCallout = (props: Omit<CalloutProps, "type">) => <Callout type="security" {...props} />;

export const TimeCallout = (props: Omit<CalloutProps, "type">) => <Callout type="time" {...props} />;
