'use client';

import { useEffect, useState } from 'react';

interface WeatherInfo {
  name: string;
  localName?: string;
  country: string;
  countryName: string;
  value: number;
  extra?: {
    windSpeed?: number;
    pressure?: number;
    visibility?: number;
    feelsLike?: number;
    temp?: number;
  };
}

interface TopCitiesResponse {
  hottest: WeatherInfo[];
  coldest: WeatherInfo[];
  mostHumid: WeatherInfo[];
  mostPolluted: WeatherInfo[];
  windiest: WeatherInfo[];
  lowestPressure: WeatherInfo[];
  lowVisibility: WeatherInfo[];
}

interface TopCitiesListProps {
  title: string;
  type: keyof TopCitiesResponse;
}

export function TopCitiesList({ title, type }: TopCitiesListProps) {
  const [cities, setCities] = useState<WeatherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/top-cities');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data: TopCitiesResponse = await response.json();
        setCities(data[type]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // 每5分钟刷新一次数据
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [type]);

  const getUnit = (type: keyof TopCitiesResponse) => {
    switch (type) {
      case 'hottest':
      case 'coldest':
        return '°C';
      case 'mostHumid':
        return '%';
      case 'mostPolluted':
        return 'AQI';
      case 'windiest':
        return 'm/s';
      case 'lowestPressure':
        return 'hPa';
      case 'lowVisibility':
        return 'm';
      default:
        return '';
    }
  };

  const getExtraInfo = (city: WeatherInfo) => {
    if (!city.extra) return null;
    
    const extraItems = [];
    if (city.extra.temp !== undefined) {
      extraItems.push(`温度: ${city.extra.temp.toFixed(1)}°C`);
    }
    if (city.extra.feelsLike !== undefined) {
      extraItems.push(`体感: ${city.extra.feelsLike.toFixed(1)}°C`);
    }
    if (city.extra.windSpeed !== undefined) {
      extraItems.push(`风速: ${city.extra.windSpeed.toFixed(1)}m/s`);
    }
    if (city.extra.pressure !== undefined) {
      extraItems.push(`气压: ${city.extra.pressure}hPa`);
    }
    if (city.extra.visibility !== undefined) {
      extraItems.push(`能见度: ${(city.extra.visibility/1000).toFixed(1)}km`);
    }
    
    return extraItems.length > 0 ? extraItems.join(' | ') : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <ul className="space-y-4">
          {cities.map((city, index) => (
            <li 
              key={city.name} 
              className="flex flex-col p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-gray-500">{index + 1}.</span>
                  <div>
                    <span className="font-medium">{city.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({city.countryName})</span>
                  </div>
                </div>
                <span className="text-lg font-semibold">
                  {typeof city.value === 'number' ? city.value.toFixed(1) : city.value}{getUnit(type)}
                </span>
              </div>
              {getExtraInfo(city) && (
                <div className="mt-2 text-sm text-gray-600 pl-8">
                  {getExtraInfo(city)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
