"use client";

import React from "react";
import { useNotification, type Notification } from "./NotificationContext";

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { hideNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/20";
      case "error":
        return "border-red-500/20";
      case "warning":
        return "border-yellow-500/20";
      case "info":
        return "border-blue-500/20";
      default:
        return "border-slate-600/20";
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/5";
      case "error":
        return "bg-red-500/5";
      case "warning":
        return "bg-yellow-500/5";
      case "info":
        return "bg-blue-500/5";
      default:
        return "bg-slate-600/5";
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border backdrop-blur-sm 
        ${getBorderColor(notification.type)} ${getBackgroundColor(notification.type)}
        bg-slate-800/90 
        transform transition-all duration-300 ease-out
        ${notification.isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
        shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {getIcon(notification.type)}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{notification.title}</p>
            {notification.message && <p className="mt-1 text-sm text-slate-300">{notification.message}</p>}
          </div>
          <button
            onClick={() => hideNotification(notification.id)}
            className="ml-4 flex-shrink-0 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-slate-600/30 w-full">
          <div
            className={`h-full ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : notification.type === "warning"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
            }`}
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default function NotificationContainer() {
  const { notifications } = useNotification();

  if (notifications.length === 0) return null;

  // Reverse the notifications array so newest appears on top
  const reversedNotifications = [...notifications].reverse();

  return (
    <div className="notification-stack-container group fixed top-20 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-sm">
      {reversedNotifications.map((notification, index) => {
        const stackY = index * 8;
        const stackX = index * -4;
        const stackScale = 1 - index * 0.02;
        const opacity = index === 0 ? 1 : Math.max(0.8 - index * 0.15, 0.4);
        const expandedY = index * 80;

        return (
          <div
            key={notification.id}
            className="notification-stack-item absolute top-0 right-0 w-full cursor-pointer transition-all duration-300 ease-out"
            style={
              {
                "--stack-y": `${stackY}px`,
                "--stack-x": `${stackX}px`,
                "--stack-scale": stackScale,
                "--stack-opacity": opacity,
                "--expanded-y": `${expandedY}px`,
                transform: `translateY(var(--current-y, var(--stack-y))) translateX(var(--current-x, var(--stack-x))) scale(var(--current-scale, var(--stack-scale)))`,
                zIndex: 50 - index,
                opacity: "var(--current-opacity, var(--stack-opacity))",
              } as React.CSSProperties & {
                "--stack-y": string;
                "--stack-x": string;
                "--stack-scale": number;
                "--stack-opacity": number;
                "--expanded-y": string;
              }
            }
          >
            <NotificationItem notification={notification} />
          </div>
        );
      })}
    </div>
  );
}
