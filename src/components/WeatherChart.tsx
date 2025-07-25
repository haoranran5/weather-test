'use client';

import { useEffect, useState } from 'react';
import { CloudRain } from 'lucide-react';

interface HourlyData {
  time: number;
  temperature: number;
  condition: string;
  precipitationProbability: number;
  windSpeed: number;
}

interface WeatherChartProps {
  cityName?: string;
  lat?: number;
  lon?: number;
}

export default function WeatherChart({ cityName, lat, lon }: WeatherChartProps) {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat && lon) {
      fetchHourlyData();
    }
  }, [lat, lon]);

  const fetchHourlyData = async () => {
    if (!lat || !lon) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 模拟24小时数据
      const mockData: HourlyData[] = Array.from({ length: 24 }, (_, i) => {
        const baseTemp = 20 + Math.sin((i - 6) * Math.PI / 12) * 8;
        const variation = (Math.random() - 0.5) * 4;
        
        return {
          time: Date.now() + i * 3600000,
          temperature: baseTemp + variation,
          condition: ['晴朗', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
          precipitationProbability: Math.random() * 100,
          windSpeed: Math.random() * 10 + 2,
        };
      });
      
      setHourlyData(mockData);
    } catch (err) {
      setError('获取天气趋势数据失败');
      console.error('Error fetching hourly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case '晴朗': return '☀️';
      case '多云': return '⛅';
      case '小雨': return '🌧️';
      case '阴天': return '☁️';
      default: return '🌤️';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 30) return 'text-red-400';
    if (temp > 20) return 'text-orange-400';
    if (temp > 10) return 'text-yellow-400';
    if (temp > 0) return 'text-blue-400';
    return 'text-cyan-400';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            📈 24小时天气趋势
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-white/30 border-t-white"></div>
          <span className="ml-3 text-white/80 text-lg">加载天气趋势中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            📈 24小时天气趋势
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="text-red-300 text-lg mb-2">⚠️</div>
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!hourlyData.length) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg flex items-center gap-3">
          📈 24小时天气趋势
          {cityName && (
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {cityName}
            </span>
          )}
        </h3>
      </div>
      
      <div>
        {/* 小时详情 - 参考shadcn/ui Card组件设计 */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {hourlyData.slice(0, 12).map((data, index) => {
            const time = new Date(data.time);
            const isRainy = data.precipitationProbability > 50;
            const isNow = index === 0;
            
            return (
              <div
                key={index}
                className={`
                  relative rounded-lg border shadow-sm
                  bg-white/10 border-white/20 backdrop-blur-sm text-white
                  p-3 text-center transition-all duration-200
                  hover:bg-white/15 hover:scale-105 hover:shadow-lg
                  ${isRainy ? 'ring-1 ring-blue-400/30 bg-blue-500/10' : ''}
                  ${isNow ? 'ring-2 ring-white/40 bg-white/20' : ''}
                `}
              >
                {/* 时间标签 */}
                <div className={`text-xs font-medium mb-2 ${isNow ? 'text-white' : 'text-white/80'}`}>
                  {isNow ? '现在' : `${time.getHours().toString().padStart(2, '0')}:00`}
                </div>
                
                {/* 天气图标 */}
                <div className="flex justify-center mb-2">
                  <div className="text-xl">
                    {getWeatherIcon(data.condition)}
                  </div>
                </div>
                
                {/* 温度 */}
                <div className={`font-bold text-base mb-1 ${getTemperatureColor(data.temperature)} ${isNow ? 'text-white' : ''}`}>
                  {data.temperature.toFixed(0)}°
                </div>
                
                {/* 天气状况 */}
                <div className="text-white/60 text-xs mb-1 truncate">
                  {data.condition}
                </div>
                
                {/* 降雨概率 */}
                {isRainy && (
                  <div className="flex items-center justify-center text-xs text-blue-300 mb-1">
                    <span className="mr-1">💧</span>
                    <span>{data.precipitationProbability.toFixed(0)}%</span>
                  </div>
                )}
                
                {/* 风速 */}
                <div className="flex items-center justify-center text-xs text-white/50">
                  <span className="mr-1">💨</span>
                  <span>{data.windSpeed.toFixed(1)}</span>
                </div>
                
                {/* 当前时间指示器 */}
                {isNow && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex flex-wrap gap-6 text-sm text-white/80 pt-6 mt-6 border-t border-white/20">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-300" />
            <span>降雨概率</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💨</span>
            <span>风速 (m/s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌡️</span>
            <span>温度趋势</span>
          </div>
        </div>
      </div>
    </div>
  );
}
