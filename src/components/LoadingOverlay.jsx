import React from "react";

export default function LoadingOverlay({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-teal-50/80 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4 shadow-lg"></div>
            <p className="text-teal-800 font-semibold text-lg tracking-wide animate-pulse">
                {message}
            </p>
        </div>
    );
}
