'use client';

import { useEffect, useState } from 'react';

interface HourlyWeatherData {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

interface HourlyForecastProps {
  cityName?: string;
  lat?: number;
  lon?: number;
}

export default function HourlyForecast({ cityName, lat, lon }: HourlyForecastProps) {
  const [hourlyData, setHourlyData] = useState<HourlyWeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    if (cityName || (lat && lon)) {
      fetchHourlyForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName, lat, lon]);

  const fetchHourlyForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (cityName) {
        params.append('city', cityName);
      } else if (lat && lon) {
        params.append('lat', lat.toString());
        params.append('lon', lon.toString());
      }

      console.log('🌤️ 获取小时预报数据...');
      
      const response = await fetch(`/api/hourly-forecast?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 API响应:', result);

      if (!result.success) {
        throw new Error(result.error || 'API返回错误');
      }

      if (!result.hourly || !Array.isArray(result.hourly) || result.hourly.length === 0) {
        throw new Error('没有获取到有效的小时预报数据');
      }

      // 转换数据格式
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedData: HourlyWeatherData[] = result.hourly.slice(0, 24).map((item: any) => {
        const date = new Date(item.time);
        return {
          time: date.getHours().toString().padStart(2, '0') + ':00',
          temperature: Math.round(item.temperature),
          condition: item.condition || '未知',
          icon: getWeatherIcon(item.condition || ''),
          precipitation: Math.round(item.precipitationProbability || 0),
          windSpeed: Math.round((item.windSpeed || 0) * 10) / 10,
          humidity: item.humidity || 0
        };
      });

      setHourlyData(formattedData);
      setDataSource(result.dataSource || '未知');
      console.log(`✅ 成功获取${formattedData.length}小时数据，来源: ${result.dataSource}`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取数据失败';
      console.error('❌ 获取小时预报失败:', err);
      setError(errorMsg);
      
      // 生成备用数据
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = () => {
    console.log('🔄 生成备用数据');
    const fallbackData: HourlyWeatherData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 3600000);
      const hour = time.getHours();
      
      // 基于时间的温度变化
      const baseTemp = 20;
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
      const randomVariation = (Math.random() - 0.5) * 3;
      
      fallbackData.push({
        time: hour.toString().padStart(2, '0') + ':00',
        temperature: Math.round(baseTemp + tempVariation + randomVariation),
        condition: getRandomCondition(),
        icon: getWeatherIcon(getRandomCondition()),
        precipitation: Math.floor(Math.random() * 40),
        windSpeed: Math.round((2 + Math.random() * 6) * 10) / 10,
        humidity: Math.floor(40 + Math.random() * 40)
      });
    }
    
    setHourlyData(fallbackData);
    setDataSource('本地生成');
  };

  const getRandomCondition = (): string => {
    const conditions = ['晴朗', '多云', '阴天', '小雨'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  const getWeatherIcon = (condition: string): string => {
    // 如果是WeatherAPI的图标URL，直接使用
    if (condition.includes('cdn.weatherapi.com') || condition.includes('openweathermap.org')) {
      return '🌤️'; // 暂时使用默认图标，后面会处理URL图标
    }

    const iconMap: { [key: string]: string } = {
      // 中文天气状况 - WeatherAPI返回的
      '晴朗': '☀️',
      '晴': '☀️',
      '晴天': '☀️',
      '多云': '⛅',
      '局部多云': '⛅',
      '局部阴天': '☁️',
      '阴天': '☁️',
      '阴': '☁️',
      '小雨': '🌧️',
      '雨': '🌧️',
      '中雨': '🌧️',
      '大雨': '🌧️',
      '暴雨': '⛈️',
      '雷雨': '⛈️',
      '雷阵雨': '⛈️',
      '零星小雨': '🌦️',
      '周边有零星小雨': '🌦️',
      '局部小雨': '🌦️',
      '毛毛雨': '🌦️',
      '阵雨': '🌦️',
      '可能有雨': '🌦️',
      '偶有阵雨': '🌦️',
      '间歇性小雨': '🌦️',
      '雪': '❄️',
      '小雪': '🌨️',
      '中雪': '❄️',
      '大雪': '❄️',
      '雾': '🌫️',
      '薄雾': '🌫️',
      '霾': '🌫️',
      '沙尘': '🌪️',

      // 英文天气状况
      'Clear': '☀️',
      'Sunny': '☀️',
      'Partly cloudy': '⛅',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Overcast': '☁️',
      'Light rain': '🌦️',
      'Light Rain': '🌦️',
      'Rain': '🌧️',
      'Heavy rain': '🌧️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Light snow': '🌨️',
      'Fog': '🌫️',
      'Mist': '🌫️'
    };

    // 优先匹配完整条件
    if (iconMap[condition]) {
      return iconMap[condition];
    }

    // 然后匹配包含关系
    for (const [key, icon] of Object.entries(iconMap)) {
      if (condition.includes(key)) {
        return icon;
      }
    }

    // 默认图标
    return '🌤️';
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-yellow-500';
    if (temp >= 5) return 'text-blue-500';
    return 'text-cyan-500';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
          📈 24小时天气预报
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg flex items-center gap-3">
          📈 24小时天气预报
          {cityName && (
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {cityName}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span>数据源: {dataSource}</span>
          {error && (
            <span className="text-yellow-300">⚠️ {error}</span>
          )}
        </div>
      </div>

      {hourlyData.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
            {hourlyData.slice(0, 12).map((data, index) => (
              <div
                key={index}
                className={`
                  flex-shrink-0 w-20 bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center
                  border border-white/20 hover:bg-white/20 transition-all duration-200
                  ${index === 0 ? 'ring-2 ring-white/40 bg-white/25' : ''}
                `}
              >
                {/* 时间 */}
                <div className={`text-xs font-medium mb-2 ${index === 0 ? 'text-white' : 'text-white/80'}`}>
                  {index === 0 ? '现在' : data.time}
                </div>
                
                {/* 天气图标 */}
                <div className="text-2xl mb-2">
                  {data.icon}
                </div>
                
                {/* 温度 */}
                <div className={`font-bold text-lg mb-1 ${getTemperatureColor(data.temperature)}`}>
                  {data.temperature}°
                </div>
                
                {/* 降水概率 */}
                {data.precipitation > 20 && (
                  <div className="text-xs text-blue-300 mb-1">
                    💧 {data.precipitation}%
                  </div>
                )}
                
                {/* 风速 */}
                <div className="text-xs text-white/60">
                  💨 {data.windSpeed}m/s
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-white/60 mb-2">📭</div>
          <p className="text-white/80">暂无预报数据</p>
        </div>
      )}
    </div>
  );
}
