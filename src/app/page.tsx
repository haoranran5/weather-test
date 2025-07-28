"use client";
import { useState } from "react";
import EnhancedWeatherSearch from "@/components/EnhancedWeatherSearch";

import ThemeToggle from "@/components/ThemeToggle";
import WeatherBackground from "@/components/WeatherBackground";
import HourlyForecast from "@/components/HourlyForecast";
import ChinaCitiesRanking from "@/components/ChinaCitiesRanking";
import { formatTemperature, getWeatherEmoji } from "@/lib/utils";

interface WeatherData {
  name: string;
  sys?: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  coord?: {
    lat: number;
    lon: number;
  };
  weather?: Array<{
    main: string;
    description: string;
  }>;
  main?: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind?: {
    speed: number;
  };
  visibility?: number;
}

export default function Page() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');

  const handleSearch = async (cityName: string) => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "获取天气信息失败");
      }

      setWeather(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "获取天气信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    if (!navigator.geolocation) {
      setError("您的浏览器不支持地理定位功能");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "获取当前位置天气失败");
          }

          setWeather(data);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "获取当前位置天气失败");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("用户拒绝了地理定位请求。请在浏览器设置中允许位置访问。");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("位置信息不可用。请检查您的网络连接或GPS设置。");
            break;
          case error.TIMEOUT:
            setError("获取位置信息超时。请重试。");
            break;
          default:
            setError("获取位置信息时发生未知错误。");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      }
    );
  };

  // 获取当前天气状况用于背景
  const weatherCondition = weather?.weather?.[0]?.description || weather?.weather?.[0]?.main;
  const isDay = weather ? new Date().getHours() >= 6 && new Date().getHours() < 18 : true;

  return (
    <WeatherBackground weatherCondition={weatherCondition} isDay={isDay}>
      <div className="min-h-screen">
        {/* 顶部导航栏 */}
        <header className="relative z-40">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Weather App</h1>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-6 py-8">
        {/* 主标题区域 */}
        <div className="text-center mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              实时天气预报
            </h2>
            <p className="text-white/80 text-lg">
              全球城市天气查询 · 空气质量监测 · 24小时趋势预报
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：天气查询 */}
          <div className="lg:col-span-2 space-y-6">
            <EnhancedWeatherSearch
              onSearch={handleSearch}
              onLocationSearch={handleLocationSearch}
              loading={loading}
              temperatureUnit={temperatureUnit}
              onTemperatureUnitChange={setTemperatureUnit}
            />

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <div className="font-semibold">获取天气信息失败</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2">加载中...</span>
            </div>
          )}

          {weather && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* 主要天气信息 */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{weather.name}</h3>
                  <p className="text-white/80 text-lg">{weather.sys?.country}</p>
                  {weather.coord && (
                    <p className="text-white/60 text-sm mt-1">
                      📍 {weather.coord.lat.toFixed(2)}°, {weather.coord.lon.toFixed(2)}°
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-6xl">
                      {getWeatherEmoji(weather.weather?.[0]?.main || '')}
                    </div>
                    <div className="text-5xl font-bold text-white drop-shadow-lg">
                      {formatTemperature(weather.main?.temp || 0, temperatureUnit)}
                    </div>
                  </div>
                  <div className="text-white/80 text-lg mb-1">
                    体感 {formatTemperature(weather.main?.feels_like || 0, temperatureUnit)}
                  </div>
                  <div className="text-white/70 text-base">
                    {weather.weather?.[0]?.description || '未知'}
                  </div>
                  {weather.main?.temp_min && weather.main?.temp_max && (
                    <div className="text-white/60 text-sm mt-2">
                      {formatTemperature(weather.main.temp_min, temperatureUnit)} / {formatTemperature(weather.main.temp_max, temperatureUnit)}
                    </div>
                  )}
                </div>
              </div>

              {/* 详细信息网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-3xl mb-2">💧</div>
                  <div className="text-white/70 text-sm mb-1">湿度</div>
                  <div className="font-bold text-white text-lg">{weather.main?.humidity || 0}%</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-3xl mb-2">💨</div>
                  <div className="text-white/70 text-sm mb-1">风速</div>
                  <div className="font-bold text-white text-lg">{(weather.wind?.speed || 0).toFixed(2)} m/s</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-3xl mb-2">🌡️</div>
                  <div className="text-white/70 text-sm mb-1">气压</div>
                  <div className="font-bold text-white text-lg">{weather.main?.pressure || 0} hPa</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-3xl mb-2">👁️</div>
                  <div className="text-white/70 text-sm mb-1">能见度</div>
                  <div className="font-bold text-white text-lg">
                    {weather.visibility ? (weather.visibility / 1000).toFixed(1) + ' km' : '未知'}
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              {weather.sys?.sunrise && weather.sys?.sunset && (
                <div className="mt-6 pt-6 border-t border-white/30">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-white/80">
                      <span className="text-2xl">🌅</span>
                      <div>
                        <div className="text-sm">日出</div>
                        <div className="font-semibold">
                          {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <span className="text-2xl">🌇</span>
                      <div>
                        <div className="text-sm">日落</div>
                        <div className="font-semibold">
                          {new Date(weather.sys.sunset * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 24小时天气预报 */}
          {weather && (
            <HourlyForecast
              cityName={weather.name}
              lat={weather.coord?.lat}
              lon={weather.coord?.lon}
            />
          )}
          </div>

          {/* 右侧：中国城市排行榜 */}
          <div className="lg:col-span-1">
            <ChinaCitiesRanking />
          </div>
        </div>

        {/* 功能特色版块 - 现代化毛玻璃设计 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mt-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">✨ 功能特色</h2>
            <p className="text-white/80 text-lg">专业级天气服务，为您提供全方位的气象信息</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 智能城市搜索 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">智能城市搜索</h3>
                <p className="text-white/80 text-sm leading-relaxed">支持中英文搜索，自动完成建议，搜索历史记录</p>
              </div>
            </div>

            {/* 本地天气查询 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">本地天气查询</h3>
                <p className="text-white/80 text-sm leading-relaxed">自动获取当前位置，显示本地实时天气</p>
              </div>
            </div>

            {/* 详细天气信息 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-violet-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">详细天气信息</h3>
                <p className="text-white/80 text-sm leading-relaxed">温度、湿度、风速、气压、能见度等完整数据</p>
              </div>
            </div>

            {/* 日出日落时间 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌅</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">日出日落时间</h3>
                <p className="text-white/80 text-sm leading-relaxed">显示当地日出日落时间，方便出行规划</p>
              </div>
            </div>

            {/* 中国城市排行榜 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🇨🇳</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">中国城市排行榜</h3>
                <p className="text-white/80 text-sm leading-relaxed">覆盖全国200+城市，包含所有省会城市和重要地级市的实时温度排行</p>
              </div>
            </div>

            {/* 温度单位切换 */}
            <div className="group relative bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-3">温度单位切换</h3>
                <p className="text-white/80 text-sm leading-relaxed">支持摄氏度和华氏度自由切换</p>
              </div>
            </div>
          </div>
        </div>


      </main>

      {/* 底部信息 - 现代化设计 */}
      <footer className="mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-center text-white/80 space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🌍</span>
                <span className="text-lg font-semibold text-white">Weather App</span>
              </div>
              <p className="text-sm">
                数据来源:
                <a
                  href="https://openweathermap.org/"
                  className="text-white hover:text-white/80 underline decoration-white/50 hover:decoration-white/80 transition-colors ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenWeatherMap API
                </a>
              </p>
              <p className="text-sm">© 2025 全球天气应用 · 实时更新 · 专业气象服务</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </WeatherBackground>
  );
}