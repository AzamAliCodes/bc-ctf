"use client";

import Image from "next/image";

interface ErrorPageProps {
    error: Error;          // Explicitly typed as Error
    reset: () => void;     // Function to reset the error boundary
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
            <h1 className="text-6xl lg:text-7xl font-mono font-bold text-cyan-400 tracking-wider">
                500
            </h1>
            <p className="text-lg font-mono text-gray-300 mt-4 tracking-widest">
                SYSTEM ERROR
            </p>

            <button
                onClick={() => reset()}
                className="mt-4 px-6 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-xl text-cyan-500 hover:bg-cyan-600/40 transition"
            >
                Retry Connection
            </button>
        </div>
    );
}
