'use client';

import { useEffect, useState, useCallback } from 'react';
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

interface ForecastResponse {
  hourly: HourlyData[];
  dataSource: string;
  lastUpdated: string;
  cacheStatus: string;
}

export default function WeatherChart({ cityName, lat, lon }: WeatherChartProps) {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  const fetchHourlyData = useCallback(async () => {
    if (!cityName && (!lat || !lon)) return;

    setLoading(true);
    setError(null);

    try {
      // 构建API请求URL
      let apiUrl = '/api/forecast?';
      if (cityName) {
        apiUrl += `city=${encodeURIComponent(cityName)}`;
      } else {
        apiUrl += `lat=${lat}&lon=${lon}`;
      }

      console.log(`🌤️ 获取24小时预报: ${apiUrl}`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.hourly || !Array.isArray(data.hourly)) {
        throw new Error('API返回数据格式错误');
      }

      // 转换API数据格式
      const formattedData: HourlyData[] = data.hourly.map((item: any) => ({
        time: item.time,
        temperature: item.temperature,
        condition: item.condition,
        precipitationProbability: item.precipitationProbability,
        windSpeed: item.windSpeed
      }));

      setHourlyData(formattedData);
      setDataSource(data.dataSource || '未知');
      console.log(`✅ 成功获取 ${formattedData.length} 小时预报数据，数据源: ${data.dataSource}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取天气趋势数据失败';
      setError(errorMessage);
      console.error('获取24小时预报失败:', err);
    } finally {
      setLoading(false);
    }
  }, [cityName, lat, lon]);

  useEffect(() => {
    if (cityName || (lat && lon)) {
      fetchHourlyData();
    }
  }, [cityName, lat, lon, fetchHourlyData]);

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
        {dataSource && (
          <div className="text-xs text-white/60 mb-2">
            数据源: {dataSource} • 实时更新
          </div>
        )}
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
