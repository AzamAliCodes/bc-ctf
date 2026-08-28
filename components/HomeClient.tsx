"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ParticleTextLoader from "./ParticleTextLoader";


const buttonBase = "h-[48px] px-8 rounded-full text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black flex items-center justify-center [text-shadow:none]";
const buttonPrimary = `${buttonBase} bg-cyan-400 text-black active:bg-cyan-600 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/70 hover:brightness-110`;
const buttonSecondary = `${buttonBase} border-2 border-white text-white bg-transparent active:bg-white/20 hover:bg-white hover:text-black hover:shadow-2xl hover:shadow-white/70`;
const tagPill = "h-[48px] px-8 border-2 border-white text-white bg-white/10 text-base font-semibold rounded-full flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:bg-cyan-600 hover:border-cyan-600 hover:text-white transition-all duration-300 [text-shadow:none] hover:shadow-2xl hover:shadow-cyan-500/70";

export default function HomeClient() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {loading && <ParticleTextLoader />}

            {!loading && (
                <div className="relative h-full flex flex-col font-mono animate-fade-in">
                    
                    <div className="fixed inset-0 -z-20 w-full h-full bg-[#0a0a0a]">
                        <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
                            style={{
                                backgroundImage: `url(/black-cat-outside-haunted-house.webp)`,
                                filter: 'brightness(0.95) contrast(1.15)',
                            }}
                        />
                        
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]"></div>
                        
                        <div className="absolute inset-0 pointer-events-none scanlines opacity-20"></div>
                    </div>

                    
                    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                        {[...Array(40)].map((_, i) => {
                            const isBlue = i % 2 === 0;
                            const size = Math.random() * 4 + 1;
                            const duration = Math.random() * 15 + 10; 
                            const delay = Math.random() * -20;
                            const left = Math.random() * 100;
                            return (
                                <div
                                    key={i}
                                    className={`absolute rounded-full opacity-0 ${isBlue ? 'bg-cyan-400 shadow-[0_0_10px_#00f0ff]' : 'bg-white shadow-[0_0_10px_#ffffff]'}`}
                                    style={{
                                        left: `${left}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        bottom: '-20px',
                                        animation: `floatUp ${duration}s linear ${delay}s infinite`
                                    }}
                                />
                            );
                        })}
                    </div>
                    
                    <header className="relative z-30 flex-none flex flex-col md:flex-row items-center justify-between p-4 lg:p-8 gap-4 md:gap-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                        
                        <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
                            <Link href="/" className="flex items-center gap-2 md:gap-4 transition-opacity hover:opacity-80">
                                <Image
                                    src="/HTB_SRMIST.png"
                                    alt="HTB SRMIST Logo"
                                    width={200}
                                    height={80}
                                    className="object-contain h-16 md:h-24 w-auto scale-110 origin-left"
                                    priority
                                />
                                <span className="text-white/50 font-sans font-bold text-sm md:text-lg mx-1 md:mx-2">X</span>
                                <Image
                                    src="/WiCyS.png"
                                    alt="WiCyS Logo"
                                    width={200}
                                    height={80}
                                    className="object-contain h-16 md:h-20 w-auto"
                                    priority
                                />
                            </Link>
                        </div>

                        
                        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-6 header-interactive-group w-full md:w-auto mt-2 md:mt-0">
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className="text-base md:text-lg font-medium text-white/70 htb-text">HTB</span>
                                <span className="text-base md:text-lg font-medium text-white/70 chennai-text"> Chennai</span>
                                <span className="text-base md:text-lg font-medium text-white/50">|</span>
                                <span className="text-base md:text-lg font-medium wicys-text">
                                    <span className="text-white/70 transition-all duration-300 wicys-wi">Wi</span><span className="text-white/70 transition-all duration-300 wicys-cys">CyS</span>
                                </span>
                            </div>
                            <div className="block h-4 md:h-5 w-[2px] bg-white/50 mx-1 md:mx-2" />
                            <Link href="/" className="text-base md:text-lg font-tech font-bold tracking-wider">
                                <span className="text-white/70 bc-ctf-text transition-all duration-300">BC-CTF</span>
                            </Link>
                        </div>
                    </header>

                    
                    <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar flex-grow flex flex-col justify-start">
                        
                        
                        <div className="flex flex-col gap-10 w-full items-start">
                            
                            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-6 w-full">
                                <div>
                                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-tech font-bold text-cyan-400 tracking-wider">
                                        BLACK CAT CTF
                                    </h1>
                                    <h2 className="mt-2 text-xl md:text-2xl lg:text-3xl font-tech font-semibold text-white/80 tracking-widest">BC-CTF</h2>
                                </div>
                                <p className="mt-2 text-base md:text-lg text-gray-300 leading-relaxed w-full">
                                    A premier cybersecurity capture the flag competition. Brought to you through a special collaboration between Hack The Box Chennai (SRMIST) and Women in CyberSecurity (WiCyS SRMIST), as we come together to organize this event.
                                </p>
                                
                                
                                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                    <Link
                                        href="https://htbchennai.in/events"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${buttonPrimary} w-full sm:w-auto`}
                                    >
                                        Register Now
                                    </Link>
                                    <button className={`${buttonSecondary} w-full sm:w-auto`}>
                                        Join Event Group
                                    </button>
                                </div>
                            </div>

                            
                            <div className="flex flex-col w-full gap-6">
                                <div className="info-box w-full bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <h3 className="text-xl font-mono font-bold text-cyan-400 md:w-1/4 md:border-r border-white/10 md:pr-4 md:border-b-0 border-b pb-2 md:pb-0">About Event</h3>
                                    <p className="text-base leading-relaxed text-gray-300 md:w-3/4">
                                        An elite cybersecurity CTF event. Participants will solve real-world security challenges across multiple domains, breaking into systems, discovering vulnerabilities, and extracting hidden flags.
                                    </p>
                                </div>
                                
                                <div className="info-box w-full bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <h3 className="text-xl font-mono font-bold text-cyan-400 md:w-1/4 md:border-r border-white/10 md:pr-4 md:border-b-0 border-b pb-2 md:pb-0">Event Details</h3>
                                    <div className="space-y-2 text-sm text-gray-300 font-mono md:w-3/4">
                                        <p><span className="font-semibold text-white">Category:</span> Cybersecurity, CTF, Jeopardy</p>
                                        <p><span className="font-semibold text-white">Venue:</span> Mini Hall 2, SRM IST</p>
                                        <p><span className="font-semibold text-white">Date:</span> September 19th</p>
                                        <p><span className="font-semibold text-white">Time:</span> 10:00 AM IST</p>
                                        <p><span className="font-semibold text-white">Pre-Requisites:</span> Charged laptop with Kali Linux (VMware/VirtualBox).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    
                    <footer className="relative z-10 w-full py-8 flex justify-center flex-none">
                        <div className="flex space-x-3">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
}
