"use client";
import React, { useState } from "react";

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

  // 获取当前位置天气
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
        if (!res.ok) throw new Error("未找到当前位置的天气信息");
        const data = await res.json();
        setWeather(data);
        setCity("");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "获取天气信息失败");
        } else {
          setError("获取天气信息失败");
        }
      } finally {
        setLoading(false);
      }
    }, () => {
      setError("定位失败");
      setLoading(false);
    });
  };

  // 天气主图标
  const getWeatherIcon = (main: string, code: string) => {
    if (code.startsWith("2")) return "⛈️"; // 雷暴
    if (code.startsWith("3")) return "🌦️"; // 毛毛雨
    if (code.startsWith("5")) return "🌧️"; // 雨
    if (code.startsWith("6")) return "🌨️"; // 雪
    if (code.startsWith("7")) return "🌫️"; // 雾
    if (code === "800") return "☀️"; // 晴
    if (code === "801") return "🌤️"; // 少云
    if (["802", "803", "804"].includes(code)) return "☁️"; // 多云
    return "❓";
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-blue-100 to-blue-200">
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
