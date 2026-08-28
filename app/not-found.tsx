import Image from "next/image";

export default function NotFound() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
            <h1 className="text-6xl lg:text-7xl font-mono font-bold text-cyan-400 tracking-wider">
                404
            </h1>
            <h2 className="mt-4 text-xl font-mono font-bold text-cyan-500 tracking-widest">PAGE NOT FOUND</h2>
        </div>
    );
}
