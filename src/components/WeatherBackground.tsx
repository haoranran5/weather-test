"use client";

import React, { useEffect, useState } from 'react';

interface WeatherBackgroundProps {
  weatherCondition?: string;
  isDay?: boolean;
  children: React.ReactNode;
}

export default function WeatherBackground({ weatherCondition, isDay = true, children }: WeatherBackgroundProps) {
  const [weatherType, setWeatherType] = useState('clear');

  useEffect(() => {
    const getWeatherType = () => {
      if (!weatherCondition) return 'clear';

      const condition = weatherCondition.toLowerCase();

      if (condition.includes('clear') || condition.includes('sunny') || condition.includes('晴')) {
        return 'clear';
      }
      if (condition.includes('cloud') || condition.includes('partly') || condition.includes('多云') || condition.includes('阴')) {
        return 'cloudy';
      }
      if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower') ||
          condition.includes('雨') || condition.includes('阵雨')) {
        return 'rainy';
      }
      if (condition.includes('thunder') || condition.includes('storm') || condition.includes('雷')) {
        return 'stormy';
      }
      if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('雪')) {
        return 'snowy';
      }
      if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze') ||
          condition.includes('雾') || condition.includes('霾')) {
        return 'foggy';
      }

      return 'clear';
    };

    setWeatherType(getWeatherType());
  }, [weatherCondition, isDay]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 天空背景 */}
      <SkyBackground weatherType={weatherType} isDay={isDay} />

      {/* 太阳 */}
      {weatherType === 'clear' && isDay && <Sun />}

      {/* 云朵 */}
      {(weatherType === 'cloudy' || weatherType === 'rainy' || weatherType === 'stormy') && (
        <Clouds weatherType={weatherType} />
      )}

      {/* 雨滴效果 */}
      {weatherType === 'rainy' && <RainEffect />}

      {/* 雪花效果 */}
      {weatherType === 'snowy' && <SnowEffect />}

      {/* 雷电效果 */}
      {weatherType === 'stormy' && <LightningEffect />}

      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// 天空背景组件 - 参考Tailwind CSS的现代设计
function SkyBackground({ weatherType, isDay }: { weatherType: string; isDay: boolean }) {
  const getSkyStyle = () => {
    if (!isDay) {
      // 夜晚 - 使用星空背景
      switch (weatherType) {
        case 'clear':
          return {
            background: `
              radial-gradient(2px 2px at 20px 30px, #eee, transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 90px 40px, #fff, transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 160px 30px, #ddd, transparent),
              linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #334155 100%)
            `,
            backgroundSize: '200px 100px, 200px 100px, 200px 100px, 200px 100px, 200px 100px, 100% 100%'
          };
        default:
          return {
            background: 'linear-gradient(to bottom, #1e293b 0%, #334155 50%, #475569 100%)'
          };
      }
    }

    // 白天 - 使用真实天空效果
    switch (weatherType) {
      case 'clear':
        return {
          background: `
            radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 50%),
            linear-gradient(to bottom,
              #87ceeb 0%,
              #98d8f4 25%,
              #a8e0f7 50%,
              #b8e8fa 75%,
              #c8f0fd 100%
            )
          `
        };
      case 'cloudy':
        return {
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(to bottom,
              #9ca3af 0%,
              #a1a8b0 25%,
              #a6adb6 50%,
              #abb2bc 75%,
              #b0b7c2 100%
            )
          `
        };
      case 'rainy':
        return {
          background: `
            linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
            linear-gradient(to bottom,
              #6b7280 0%,
              #5b6470 25%,
              #4b5563 50%,
              #3b4756 75%,
              #2b3849 100%
            )
          `,
          backgroundSize: '20px 20px, 20px 20px, 100% 100%'
        };
      case 'stormy':
        return {
          background: `
            radial-gradient(circle at 30% 20%, rgba(139,69,19,0.3) 0%, transparent 50%),
            linear-gradient(to bottom,
              #374151 0%,
              #2d3748 25%,
              #1a202c 50%,
              #171923 75%,
              #0d1117 100%
            )
          `
        };
      case 'snowy':
        return {
          background: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(to bottom,
              #e5e7eb 0%,
              #d1d5db 25%,
              #9ca3af 50%,
              #6b7280 75%,
              #4b5563 100%
            )
          `,
          backgroundSize: '50px 50px, 100% 100%'
        };
      default:
        return {
          background: 'linear-gradient(to bottom, #87ceeb 0%, #98d8f4 50%, #a8e0f7 100%)'
        };
    }
  };

  return (
    <div
      className="absolute inset-0 transition-all duration-1000"
      style={getSkyStyle()}
    />
  );
}

// 太阳组件 - 参考shadcn/ui设计风格
function Sun() {
  return (
    <div className="absolute top-16 right-16 z-5">
      <div className="relative">
        {/* 外层光晕 - 使用box-shadow实现多层光效 */}
        <div
          className="absolute inset-0 w-20 h-20 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,223,0,0.4) 0%, rgba(255,193,7,0.2) 50%, transparent 70%)',
            boxShadow: `
              0 0 20px rgba(255,223,0,0.6),
              0 0 40px rgba(255,193,7,0.4),
              0 0 60px rgba(255,152,0,0.2)
            `
          }}
        />

        {/* 太阳主体 - 使用现代渐变和阴影 */}
        <div
          className="relative w-16 h-16 rounded-full shadow-2xl"
          style={{
            background: `
              radial-gradient(circle at 30% 30%,
                #fff3cd 0%,
                #ffd60a 25%,
                #ffbe0b 50%,
                #fb8500 75%,
                #f77f00 100%
              )
            `,
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.1),
              0 4px 8px rgba(0,0,0,0.2)
            `
          }}
        >


          {/* 太阳表面细节 */}
          <div className="absolute inset-2 rounded-full opacity-30">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 40% 40%,
                    rgba(255,255,255,0.4) 0%,
                    transparent 50%
                  )
                `
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 云朵组件 - 参考shadcn/ui的现代设计
function Clouds({ weatherType }: { weatherType: string }) {
  const getCloudStyle = () => {
    switch (weatherType) {
      case 'rainy':
        return {
          fill: '#6b7280',
          opacity: 0.9,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        };
      case 'stormy':
        return {
          fill: '#374151',
          opacity: 0.95,
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))'
        };
      default:
        return {
          fill: '#9ca3af',
          opacity: 0.7,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        };
    }
  };

  return (
    <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${5 + (i * 12)}%`,
            left: `${-30 + (i * 20)}%`,
            transform: `scale(${0.8 + Math.random() * 0.6})`,
            animation: `cloudFloat ${40 + i * 10}s linear infinite`,
            animationDelay: `${i * -8}s`
          }}
        >
          <CloudSVG style={getCloudStyle()} />
        </div>
      ))}

      <style jsx>{`
        @keyframes cloudFloat {
          from {
            transform: translateX(-200px) scale(var(--scale, 1));
          }
          to {
            transform: translateX(calc(100vw + 200px)) scale(var(--scale, 1));
          }
        }
      `}</style>
    </div>
  );
}

// SVG云朵 - 参考shadcn/ui的精细设计
function CloudSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" style={style}>
      <defs>
        <filter id="cloudFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="4" result="offset"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)"/>
          <stop offset="50%" stopColor="rgba(255,255,255,0.7)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.5)"/>
        </linearGradient>
      </defs>

      {/* 主云朵形状 */}
      <path
        d="M30 70
           Q30 50, 50 50
           Q55 30, 75 35
           Q85 25, 100 35
           Q115 30, 125 45
           Q140 50, 135 65
           Q130 75, 115 75
           L45 75
           Q35 75, 30 70 Z"
        fill="url(#cloudGradient)"
        filter="url(#cloudFilter)"
      />

      {/* 云朵细节层 */}
      <path
        d="M45 65
           Q45 55, 55 55
           Q60 45, 70 50
           Q80 45, 90 50
           Q100 45, 105 55
           Q110 60, 105 65
           L55 65
           Q50 65, 45 65 Z"
        fill="rgba(255,255,255,0.3)"
        opacity="0.6"
      />

      {/* 高光效果 */}
      <ellipse
        cx="70" cy="45"
        rx="15" ry="8"
        fill="rgba(255,255,255,0.4)"
        opacity="0.8"
      />
    </svg>
  );
}

// 雨滴效果 - 参考现代UI设计
function RainEffect() {
  return (
    <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
      {Array.from({ length: 200 }, (_, i) => {
        const size = Math.random() * 0.5 + 0.3; // 0.3-0.8
        const opacity = Math.random() * 0.4 + 0.3; // 0.3-0.7
        const speed = Math.random() * 0.3 + 0.4; // 0.4-0.7s

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${12 + Math.random() * 8}px`,
              background: `linear-gradient(to bottom,
                rgba(173, 216, 230, ${opacity * 0.3}),
                rgba(135, 206, 235, ${opacity * 0.7}),
                rgba(70, 130, 180, ${opacity})
              )`,
              animationDelay: `${Math.random() * 2}s`,
              animation: `rainFall ${speed}s linear infinite`,
              filter: 'blur(0.5px)'
            }}
          />
        );
      })}

      <style jsx>{`
        @keyframes rainFall {
          from {
            transform: translateY(-100vh) rotate(10deg);
          }
          to {
            transform: translateY(100vh) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}

// 雪花效果 - 更真实的雪花设计
function SnowEffect() {
  const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❋'];

  return (
    <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
      {Array.from({ length: 100 }, (_, i) => {
        const size = Math.random() * 8 + 6; // 6-14px
        const opacity = Math.random() * 0.6 + 0.4; // 0.4-1.0
        const speed = Math.random() * 3 + 2; // 2-5s
        const snowflake = snowflakes[Math.floor(Math.random() * snowflakes.length)];

        return (
          <div
            key={i}
            className="absolute text-white"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${size}px`,
              opacity: opacity,
              animationDelay: `${Math.random() * 5}s`,
              animation: `snowFall ${speed}s linear infinite`,
              textShadow: '0 0 3px rgba(255,255,255,0.8)',
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
            }}
          >
            {snowflake}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes snowFall {
          0% {
            transform: translateY(-100vh) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-75vh) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(-50vh) translateX(-5px) rotate(180deg);
          }
          75% {
            transform: translateY(-25vh) translateX(15px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(0px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// 雷电效果
function LightningEffect() {
  return (
    <div className="absolute inset-0 z-5 pointer-events-none">
      <div className="lightning-flash absolute inset-0 bg-white opacity-0" />

      <style jsx>{`
        .lightning-flash {
          animation: lightning 4s infinite;
        }

        @keyframes lightning {
          0%, 90%, 100% {
            opacity: 0;
          }
          5%, 10% {
            opacity: 0.8;
          }
          15%, 20% {
            opacity: 0;
          }
          25%, 30% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
