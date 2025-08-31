"use client";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClickSpark from "@/components/ClickSpark";
import { DarkModeProvider, useDarkMode } from "@/lib/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }) {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100'
    }`}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float-slow ${
          isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : 'bg-gradient-to-r from-cyan-300 to-blue-300'
        }`}></div>
        
        <div className={`absolute top-40 right-10 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float-medium ${
          isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-300 to-pink-300'
        }`}></div>
        
        <div className={`absolute bottom-20 left-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-fast ${
          isDarkMode ? 'bg-gradient-to-r from-indigo-600 to-cyan-600' : 'bg-gradient-to-r from-indigo-300 to-cyan-300'
        }`}></div>
        
        {/* Secondary smaller orbs */}
        <div className={`absolute top-1/3 left-1/4 w-48 h-48 rounded-full mix-blend-multiply filter blur-lg opacity-25 animate-pulse-slow ${
          isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-emerald-300 to-teal-300'
        }`}></div>
        
        <div className={`absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full mix-blend-multiply filter blur-lg opacity-25 animate-pulse-medium ${
          isDarkMode ? 'bg-gradient-to-r from-rose-600 to-orange-600' : 'bg-gradient-to-r from-rose-300 to-orange-300'
        }`}></div>
        
        {/* Geometric shapes */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rotate-45 opacity-10 animate-spin-slow ${
          isDarkMode ? 'bg-gradient-to-br from-violet-600 to-purple-600' : 'bg-gradient-to-br from-violet-200 to-purple-200'
        }`} style={{borderRadius: '30%'}}></div>
        
        {/* Particle effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-twinkle opacity-30 ${
                isDarkMode ? 'bg-cyan-400' : 'bg-blue-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Gradient overlay for depth */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30'
            : 'bg-gradient-to-t from-white/30 via-transparent to-blue-50/50'
        }`}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(270deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-medium {
          animation: pulse-medium 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DarkModeProvider>
          <LayoutContent>{children}</LayoutContent>
          <ClickSpark particleCount={6} colors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"]} />
        </DarkModeProvider>
      </body>
    </html>
  );
}