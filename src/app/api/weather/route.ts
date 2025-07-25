import { NextRequest, NextResponse } from "next/server";
import { getCityChineseName } from "@/constants/city-translations";

// WeatherAPI.com 配置
const WEATHERAPI_CONFIG = {
  key: process.env.WEATHERAPI_KEY,
  limit: 10000, // 每月10000次
  resetInterval: 30 * 24 * 60 * 60 * 1000, // 30天
  counter: 0,
  lastReset: new Date()
};

// 缓存配置
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存
let cache: Map<string, { data: any; timestamp: number }> = new Map();

// 检查并重置计数器
function checkAndResetCounter() {
  const now = new Date();
  if (now.getTime() - WEATHERAPI_CONFIG.lastReset.getTime() > WEATHERAPI_CONFIG.resetInterval) {
    WEATHERAPI_CONFIG.counter = 0;
    WEATHERAPI_CONFIG.lastReset = now;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!city && (!lat || !lon)) {
    return NextResponse.json(
      { error: "请提供城市名称或经纬度坐标" },
      { status: 400 }
    );
  }

  if (!WEATHERAPI_CONFIG.key) {
    return NextResponse.json(
      { error: "API密钥未配置" },
      { status: 500 }
    );
  }

  checkAndResetCounter();

  // 检查API调用限制
  if (WEATHERAPI_CONFIG.counter >= WEATHERAPI_CONFIG.limit) {
    return NextResponse.json(
      { error: "API调用次数已达上限，请稍后重试" },
      { status: 429 }
    );
  }

  try {
    let query: string;
    let cacheKey: string;

    if (city) {
      query = encodeURIComponent(city);
      cacheKey = `city-${city}`;
    } else {
      query = `${lat},${lon}`;
      cacheKey = `coords-${lat}-${lon}`;
    }

    // 检查缓存
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_CONFIG.key}&q=${query}&aqi=yes&lang=zh`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        return NextResponse.json(
          { error: "未找到该城市，请检查城市名称是否正确" },
          { status: 404 }
        );
      }
      throw new Error(`WeatherAPI.com error: ${response.status}`);
    }

    const rawData = await response.json();
    WEATHERAPI_CONFIG.counter++;

    // 转换为统一格式，兼容原有的OpenWeatherMap格式
    const transformedData = {
      coord: {
        lon: rawData.location.lon,
        lat: rawData.location.lat
      },
      weather: [{
        id: rawData.current.condition.code,
        main: rawData.current.condition.text,
        description: rawData.current.condition.text,
        icon: rawData.current.condition.icon
      }],
      base: "stations",
      main: {
        temp: rawData.current.temp_c,
        feels_like: rawData.current.feelslike_c,
        temp_min: rawData.current.temp_c - 2, // WeatherAPI不提供min/max，估算
        temp_max: rawData.current.temp_c + 2,
        pressure: rawData.current.pressure_mb,
        humidity: rawData.current.humidity
      },
      visibility: rawData.current.vis_km * 1000, // 转换为米
      wind: {
        speed: rawData.current.wind_kph / 3.6, // 转换为 m/s
        deg: rawData.current.wind_degree,
        gust: rawData.current.gust_kph ? rawData.current.gust_kph / 3.6 : undefined
      },
      clouds: {
        all: rawData.current.cloud
      },
      dt: Math.floor(new Date(rawData.location.localtime).getTime() / 1000),
      sys: {
        type: 1,
        id: 0,
        country: rawData.location.country,
        sunrise: 0, // WeatherAPI不在current中提供，需要单独查询
        sunset: 0
      },
      timezone: 0,
      id: 0,
      name: getCityChineseName(rawData.location.name) || rawData.location.name,
      cod: 200,
      // WeatherAPI.com 特有的额外数据
      weatherapi: {
        location: {
          name: rawData.location.name,
          region: rawData.location.region,
          country: rawData.location.country,
          lat: rawData.location.lat,
          lon: rawData.location.lon,
          tz_id: rawData.location.tz_id,
          localtime: rawData.location.localtime
        },
        current: {
          uv: rawData.current.uv,
          air_quality: rawData.current.air_quality ? {
            co: rawData.current.air_quality.co,
            no2: rawData.current.air_quality.no2,
            o3: rawData.current.air_quality.o3,
            so2: rawData.current.air_quality.so2,
            pm2_5: rawData.current.air_quality.pm2_5,
            pm10: rawData.current.air_quality.pm10,
            us_epa_index: rawData.current.air_quality["us-epa-index"],
            gb_defra_index: rawData.current.air_quality["gb-defra-index"]
          } : null
        },
        source: "WeatherAPI.com"
      }
    };

    // 更新缓存
    cache.set(cacheKey, {
      data: transformedData,
      timestamp: now
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "获取天气数据失败，请稍后重试" },
      { status: 500 }
    );
  }
}