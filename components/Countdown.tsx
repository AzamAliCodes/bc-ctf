"use client";
import { useState, useEffect } from "react";

// Event date: 19 September 2026, 10:00 AM IST (UTC+5:30)
const EVENT_DATE = new Date("2026-09-19T10:00:00+05:30");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface UnitProps {
  value: string;
  label: string;
}

function TimeUnit({ value, label }: UnitProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-tech text-2xl sm:text-3xl md:text-4xl text-white tabular-nums tracking-widest"
        style={{ textShadow: "0 0 20px rgba(159,239,0,0.3)" }}
      >
        {value}
      </span>
      <span className="font-tech text-[10px] sm:text-xs text-white/40 tracking-[0.25em] uppercase">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft.expired) {
    return (
      <div className="font-tech text-xl text-[#9fef00] tracking-widest animate-pulse">
        EVENT IS LIVE
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 sm:gap-3 md:gap-4 mt-1"
      aria-label="Countdown to Black Cat CTF"
      role="timer"
    >
      <TimeUnit value={pad(timeLeft.days)} label="days" />

      {/* Separator */}
      <span
        className="font-tech text-2xl sm:text-3xl md:text-4xl text-[#9fef00] select-none mt-[-2px] animate-pulse"
        style={{ textShadow: "0 0 12px #9fef00" }}
        aria-hidden
      >
        :
      </span>

      <TimeUnit value={pad(timeLeft.hours)} label="hours" />

      <span
        className="font-tech text-3xl sm:text-4xl md:text-5xl text-[#9fef00] select-none mt-[-2px] animate-pulse"
        style={{ textShadow: "0 0 12px #9fef00", animationDelay: "0.3s" }}
        aria-hidden
      >
        :
      </span>

      <TimeUnit value={pad(timeLeft.minutes)} label="min" />

      <span
        className="font-tech text-3xl sm:text-4xl md:text-5xl text-[#9fef00] select-none mt-[-2px] animate-pulse"
        style={{ textShadow: "0 0 12px #9fef00", animationDelay: "0.6s" }}
        aria-hidden
      >
        :
      </span>

      <TimeUnit value={pad(timeLeft.seconds)} label="sec" />
    </div>
  );
}
