import { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  theme: 'light' | 'dark';
}

export default function SplashScreen({ onComplete, theme }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Auto-complete after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // Wait for fade-out animation
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const isLight = theme === 'light';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        } ${isLight
          ? 'bg-gradient-to-b from-gray-50 to-gray-100'
          : 'bg-gradient-to-b from-gray-900 to-gray-950'
        }`}
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-left accent circle */}
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${isLight ? 'bg-blue-100 opacity-30' : 'bg-blue-900 opacity-30'
            }`}
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        />

        {/* Bottom-right accent circle */}
        <div
          className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl ${isLight ? 'bg-blue-100 opacity-25' : 'bg-blue-900 opacity-35'
            }`}
          style={{ animation: 'pulse 10s ease-in-out infinite 2s' }}
        />

        {/* Solar panel pattern - bottom center */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-16 h-32 rounded-sm transform rotate-12 ${isLight ? 'bg-blue-500 opacity-15' : 'bg-blue-400 opacity-20'
                }`}
              style={{
                transform: `rotate(${12 + i * 3}deg) translateX(${i * 8}px)`,
                animation: `fadeIn 0.5s ease-out ${i * 0.1}s backwards`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Sun icon with rotation animation */}
        <div
          className="flex justify-center mb-8"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div className="relative">
            <Sun
              size={80}
              className={`${isLight ? 'text-amber-400' : 'text-amber-300'
                }`}
              style={{
                animation: 'rotateSlow 20s linear infinite',
                filter: isLight
                  ? 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))'
                  : 'drop-shadow(0 0 30px rgba(252, 211, 77, 0.4))',
              }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Company Logo */}
        <div
          className="mb-6"
          style={{ animation: 'fadeIn 0.3s ease-out 0.1s backwards' }}
        >
          <div className="relative w-44 h-44 mx-auto">
            <img
              src="/logo.png"
              alt="Apex Solar Logo"
              className="w-full h-full object-contain"
              style={{
                filter: isLight
                  ? 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.08)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.15))'
                  : 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 50px rgba(96, 165, 250, 0.2))',
              }}
            />
          </div>
        </div>

        {/* Company name */}
        <h1
          className={`text-5xl font-bold mb-4 tracking-[0.2em] ${isLight ? 'text-gray-800' : 'text-gray-100'
            }`}
          style={{
            animation: 'slideUp 0.5s ease-out 0.2s backwards',
            textShadow: isLight
              ? '0 2px 4px rgba(0, 0, 0, 0.05)'
              : '0 0 20px rgba(96, 165, 250, 0.3)',
          }}
        >
          APEX SOLAR
        </h1>

        {/* Tagline */}
        <p
          className={`text-lg font-medium mb-12 tracking-wide ${isLight ? 'text-gray-500' : 'text-gray-400'
            }`}
          style={{ animation: 'fadeIn 0.5s ease-out 0.4s backwards' }}
        >
          Invoice Generation System
        </p>

        {/* Loading indicator - Progress bar */}
        <div
          className="w-72 mx-auto mb-8"
          style={{ animation: 'fadeIn 0.5s ease-out 0.6s backwards' }}
        >
          <div
            className={`h-1 rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-gray-700'
              }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${isLight ? 'bg-blue-600' : 'bg-blue-400'
                }`}
              style={{
                width: `${progress}%`,
                boxShadow: isLight
                  ? 'none'
                  : '0 0 8px rgba(96, 165, 250, 0.5)',
              }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div
          className="flex justify-center gap-2 mb-12"
          style={{ animation: 'fadeIn 0.5s ease-out 0.7s backwards' }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${isLight ? 'bg-blue-600' : 'bg-blue-400'
                }`}
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                boxShadow: isLight
                  ? 'none'
                  : '0 0 8px rgba(96, 165, 250, 0.4)',
              }}
            />
          ))}
        </div>

        {/* Footer text */}
        <p
          className={`text-xs tracking-wide ${isLight ? 'text-gray-400' : 'text-gray-500'
            }`}
          style={{ animation: 'fadeIn 0.5s ease-out 0.8s backwards' }}
        >
          Solar Power Plant Installation and Commissioning
        </p>
      </div>

      {/* Version number - bottom right */}
      <div
        className={`absolute bottom-6 right-6 text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'
          }`}
        style={{ animation: 'fadeIn 0.5s ease-out 1s backwards' }}
      >
        v1.1.0
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes rotateSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
