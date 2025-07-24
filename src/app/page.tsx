"use client";
import React, { useState, useEffect } from "react";

// 热门城市列表
const POPULAR_CITIES = [
  "北京", "上海", "广州", "深圳", "杭州", "成都",
  "New York", "London", "Paris", "Tokyo", "Sydney", "Dubai"
];

// 定义榜单数据类型
interface TopCitiesData {
  hottest: Array<{ name: string; country: string; temp: number }>;
  coldest: Array<{ name: string; country: string; temp: number }>;
  mostHumid: Array<{ name: string; country: string; humidity: number }>;
  mostPolluted: Array<{ name: string; country: string; aqi: number }>;
}

function formatTime(ts: number, tz: number) {
  const date = new Date((ts + tz) * 1000);
  return date.toTimeString().slice(0, 5);
}

// 在import后添加Weather类型定义
interface Weather {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    id: number;
  }>;
  wind: {
    speed: number;
  };
  timezone: number;
}

export default function Page() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 新增：榜单数据
  const [topData, setTopData] = useState<TopCitiesData | null>(null);
  const [topLoading, setTopLoading] = useState(true);
  const [topError, setTopError] = useState("");
  const [activeTab, setActiveTab] = useState<'hottest' | 'coldest' | 'mostHumid' | 'mostPolluted'>('hottest');

  useEffect(() => {
    const fetchTop = async () => {
      setTopLoading(true);
      setTopError("");
      try {
        const res = await fetch("/api/top-cities");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "榜单获取失败");
        setTopData(data);
      } catch (e: unknown) {
        setTopError(e.message || "榜单获取失败");
      } finally {
        setTopLoading(false);
      }
    };
    fetchTop();
  }, []);

  const fetchWeather = async (cityName?: string) => {
    const query = cityName ?? city;
    if (!query) return;
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("未找到该城市的天气信息");
      const data = await res.json();
      setWeather(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "获取天气信息失败");
      } else {
        setError("获取天气信息失败");
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取当前定位天气
  const fetchCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("浏览器不支持定位");
      return;
    }
    setLoading(true);
    setError("");
    setWeather(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (!res.ok) {
          if (data?.error) {
            setError(data.error);
          } else {
            setError("未找到当前位置的天气信息");
          }
          return;
        }
        setWeather(data);
        setCity("");
      } catch {
        setError("获取当前位置天气失败，请检查网络");
      } finally {
        setLoading(false);
      }
    }, () => {
      setError("定位失败，请检查浏览器权限设置");
      setLoading(false);
    });
  };

  // 天气主图标
  const getWeatherIcon = (main: string, code: string) => {
    const codeNum = parseInt(code);
    if (codeNum >= 200 && codeNum < 300) return "⛈️"; // 雷暴
    if (codeNum >= 300 && codeNum < 400) return "🌦️"; // 毛毛雨
    if (codeNum >= 500 && codeNum < 600) return "🌧️"; // 雨
    if (codeNum >= 600 && codeNum < 700) return "🌨️"; // 雪
    if (codeNum >= 700 && codeNum < 800) return "🌫️"; // 雾霾
    if (codeNum === 800) return "☀️"; // 晴天
    if (codeNum === 801) return "🌤️"; // 少云
    if (codeNum >= 802 && codeNum <= 804) return "☁️"; // 多云
    return "❓";
  };

  // 获取AQI等级描述和颜色
  const getAQIInfo = (aqi: number) => {
    switch (aqi) {
      case 1: return { text: "优", color: "text-green-600", bg: "bg-green-100" };
      case 2: return { text: "良", color: "text-yellow-600", bg: "bg-yellow-100" };
      case 3: return { text: "轻度污染", color: "text-orange-600", bg: "bg-orange-100" };
      case 4: return { text: "中度污染", color: "text-red-600", bg: "bg-red-100" };
      case 5: return { text: "重度污染", color: "text-purple-600", bg: "bg-purple-100" };
      default: return { text: "未知", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  // 渲染榜单内容
  const renderRankingContent = () => {
    if (!topData) return null;
    
    switch (activeTab) {
      case 'hottest':
        return topData.hottest.map((c, i) => (
          <li key={`${c.name}-${c.country}`} className="flex justify-between items-center py-2 px-3 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors" onClick={() => fetchWeather(c.name)}>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.country}</div>
              </div>
            </div>
            <div className="text-orange-600 font-bold">{c.temp.toFixed(1)}°C</div>
          </li>
        ));
      case 'coldest':
        return topData.coldest.map((c, i) => (
          <li key={`${c.name}-${c.country}`} className="flex justify-between items-center py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" onClick={() => fetchWeather(c.name)}>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.country}</div>
              </div>
            </div>
            <div className="text-blue-600 font-bold">{c.temp.toFixed(1)}°C</div>
          </li>
        ));
      case 'mostHumid':
        return topData.mostHumid.map((c, i) => (
          <li key={`${c.name}-${c.country}`} className="flex justify-between items-center py-2 px-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors" onClick={() => fetchWeather(c.name)}>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.country}</div>
              </div>
            </div>
            <div className="text-green-600 font-bold">{c.humidity}%</div>
          </li>
        ));
      case 'mostPolluted':
        return topData.mostPolluted.map((c, i) => {
          const aqiInfo = getAQIInfo(c.aqi);
          return (
            <li key={`${c.name}-${c.country}`} className="flex justify-between items-center py-2 px-3 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" onClick={() => fetchWeather(c.name)}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${aqiInfo.bg} ${aqiInfo.color}`}>
                  {aqiInfo.text}
                </span>
                <span className="text-red-600 font-bold">AQI {c.aqi}</span>
              </div>
            </li>
          );
        });
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 顶部标题 */}
      <div className="w-full bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">🌍 全球天气预报</h1>
          <p className="text-gray-600 text-center mt-2">实时天气信息 · 全球城市排行榜</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：天气查询 */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">天气查询</h2>
              
              {/* 搜索框 */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="输入城市名（中文或英文）"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg bg-white/80"
                  onKeyDown={e => { if (e.key === 'Enter') fetchWeather(); }}
                />
                <button
                  onClick={() => fetchWeather()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "搜索中..." : "搜索"}
                </button>
              </div>

              <button
                onClick={fetchCurrentLocationWeather}
                className="w-full mb-6 bg-gray-100 text-gray-700 rounded-xl py-3 hover:bg-gray-200 transition-colors text-sm font-medium"
                disabled={loading}
              >
                📍 获取当前位置天气
              </button>

              {/* 热门城市快捷按钮 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">热门城市</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.map(cityName => (
                    <button
                      key={cityName}
                      onClick={() => fetchWeather(cityName)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors"
                      disabled={loading}
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </div>

              {/* 天气信息显示 */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-blue-600">加载中...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  ❌ {error}
                </div>
              )}
              
              {weather && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  {/* 主要天气信息 */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{weather.name}</h3>
                      <p className="text-gray-600">{weather.sys?.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-700">{Math.round(weather.main.temp)}°C</div>
                      <div className="text-gray-500 text-sm">体感 {Math.round(weather.main.feels_like)}°C</div>
                    </div>
                  </div>

                  {/* 天气描述 */}
                  <div className="flex items-center justify-center mb-6 bg-white/60 rounded-lg py-4">
                    <span className="text-4xl mr-3">{getWeatherIcon(weather.weather[0].main, String(weather.weather[0].id))}</span>
                    <span className="text-lg text-gray-700 font-medium">{weather.weather[0].description}</span>
                  </div>

                  {/* 详细信息网格 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">💧</div>
                      <div className="text-xs text-gray-500 mb-1">湿度</div>
                      <div className="font-semibold text-blue-600">{weather.main.humidity}%</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">💨</div>
                      <div className="text-xs text-gray-500 mb-1">风速</div>
                      <div className="font-semibold text-blue-600">{weather.wind.speed} m/s</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">🌡️</div>
                      <div className="text-xs text-gray-500 mb-1">气压</div>
                      <div className="font-semibold text-blue-600">{weather.main.pressure} hPa</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">🌅</div>
                      <div className="text-xs text-gray-500 mb-1">日出/日落</div>
                      <div className="font-semibold text-blue-600 text-xs">
                        {formatTime(weather.sys.sunrise, weather.timezone)}<br/>
                        {formatTime(weather.sys.sunset, weather.timezone)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：全球排行榜 */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">全球城市排行榜</h2>
              
              {topLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-blue-600 text-sm">加载中...</span>
                </div>
              ) : topError ? (
                <div className="text-center text-red-500 py-8">{topError}</div>
              ) : topData && (
                <>
                  {/* 标签页切换 */}
                  <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('hottest')}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'hottest' 
                          ? 'bg-orange-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      🔥 最热
                    </button>
                    <button
                      onClick={() => setActiveTab('coldest')}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'coldest' 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      🧊 最冷
                    </button>
                    <button
                      onClick={() => setActiveTab('mostHumid')}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'mostHumid' 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      💧 最湿
                    </button>
                    <button
                      onClick={() => setActiveTab('mostPolluted')}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeTab === 'mostPolluted' 
                          ? 'bg-red-500 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      🏭 污染
                    </button>
                  </div>

                  {/* 排行榜内容 */}
                  <div className="max-h-96 overflow-y-auto">
                    <ol className="space-y-1">
                      {renderRankingContent()}
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>
            数据来源: <a href="https://openweathermap.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">OpenWeatherMap API</a>
          </p>
          <p className="mt-1">© 2025 全球天气应用 · 实时更新</p>
        </div>
      </div>
    </div>
  );
}
        {topLoading ? (
          <div className="col-span-4 text-center text-blue-500">榜单加载中...</div>
        ) : topError ? (
          <div className="col-span-4 text-center text-red-500">{topError}</div>
        ) : topData && (
          <>
            <div className="bg-white/90 rounded-xl shadow p-4">
              <div className="font-bold text-lg mb-2 text-orange-600">全球最热城市TOP10</div>
              <ol className="text-sm space-y-1">
                {topData.hottest.map((c, i: number) => (
                  <li key={c.name + c.country} className="flex justify-between">
                    <span>{i + 1}. {c.name} ({c.country})</span>
                    <span className="font-mono">{c.temp}°C</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-4">
              <div className="font-bold text-lg mb-2 text-blue-600">全球最冷城市TOP10</div>
              <ol className="text-sm space-y-1">
                {topData.coldest.map((c, i: number) => (
                  <li key={c.name + c.country} className="flex justify-between">
                    <span>{i + 1}. {c.name} ({c.country})</span>
                    <span className="font-mono">{c.temp}°C</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-4">
              <div className="font-bold text-lg mb-2 text-green-700">全球湿度最高TOP10</div>
              <ol className="text-sm space-y-1">
                {topData.mostHumid.map((c, i: number) => (
                  <li key={c.name + c.country} className="flex justify-between">
                    <span>{i + 1}. {c.name} ({c.country})</span>
                    <span className="font-mono">{c.humidity}%</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-4">
              <div className="font-bold text-lg mb-2 text-red-700">全球空气污染最严重TOP10</div>
              <ol className="text-sm space-y-1">
                {topData.mostPolluted.map((c, i: number) => (
                  <li key={c.name + c.country} className="flex justify-between">
                    <span>{i + 1}. {c.name} ({c.country})</span>
                    <span className="font-mono">AQI {c.aqi}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
      {/* 顶部标题 */}
      <div className="w-full flex flex-col items-center mt-10">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">OpenWeather 天气</h1>
        <div className="text-gray-500 mb-2">使用OpenWeatherMap API查询全球天气</div>
      </div>
      {/* 查询卡片 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-white/80 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
          {/* 搜索框 */}
          <div className="flex w-full mb-4 gap-2">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="输入城市名"
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg bg-white"
              onKeyDown={e => { if (e.key === 'Enter') fetchWeather(); }}
            />
            <button
              onClick={() => fetchWeather()}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              disabled={loading}
            >
              搜索
            </button>
          </div>
          <button
            onClick={fetchCurrentLocationWeather}
            className="w-full mb-4 bg-gray-100 text-gray-600 rounded-lg py-2 hover:bg-blue-100 transition text-sm"
            disabled={loading}
          >
            获取当前位置天气
          </button>
          {/* 天气信息卡片 */}
          {loading && <div className="text-blue-500 my-6">加载中...</div>}
          {error && <div className="text-red-500 my-6">{error}</div>}
          {weather && (
            <div className="w-full flex flex-col items-center">
              <div className="flex w-full justify-between items-center mb-1">
                <div>
                  <div className="text-xl font-bold leading-tight">{weather.name}</div>
                  <div className="text-gray-500 text-sm">{weather.sys?.country}</div>
                </div>
                <div className="text-3xl font-bold text-blue-700">{Math.round(weather.main.temp)}°C</div>
              </div>
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-gray-400 text-xs">体感温度: {Math.round(weather.main.feels_like)}°C</div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getWeatherIcon(weather.weather[0].main, String(weather.weather[0].id))}</span>
                <span className="text-base text-gray-700">{weather.weather[0].description}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-xs text-gray-400 mb-1">湿度</div>
                  <div className="text-lg font-semibold">{weather.main.humidity}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-xs text-gray-400 mb-1">风速</div>
                  <div className="text-lg font-semibold">{weather.wind.speed} m/s</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-xs text-gray-400 mb-1">气压</div>
                  <div className="text-lg font-semibold">{weather.main.pressure} hPa</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-xs text-gray-400 mb-1">日出/日落</div>
                  <div className="text-lg font-semibold">
                    {formatTime(weather.sys.sunrise, weather.timezone)} / {formatTime(weather.sys.sunset, weather.timezone)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 底部信息 */}
      <div className="w-full flex flex-col items-center mb-6 mt-10 text-gray-400 text-xs">
        <div>
          数据来源: <a href="https://openweathermap.org/" className="underline hover:text-blue-600" target="_blank">OpenWeatherMap API</a>
        </div>
        <div className="mt-1">© 2025 全球天气应用</div>
      </div>
    </div>
  );
}
