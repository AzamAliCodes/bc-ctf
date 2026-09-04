// components/BackgroundEffects.tsx
"use client"; // Required for Next.js App Router Client Components
// Removed import for styles/BackgroundEffects.css as its content is now in app/globals.css

export default function BackgroundEffects() {
    return (
        <>
            {/* Scanlines Effect — subtle CRT feel */}
            <div className="scanlines" />

            {/* Film grain overlay — adds texture/depth over the whole viewport */}
            <div className="grain" />
        </>
    );
}