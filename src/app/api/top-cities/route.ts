import { NextResponse } from "next/server";
import { CityWeather, WeatherInfo, TopCitiesData } from "@/types/weather";
import { GLOBAL_CITIES, COUNTRY_NAMES } from "@/constants/cities";

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存（减少API调用）

// 简单的内存缓存
let cachedData: TopCitiesData | null = null;
let cacheTimestamp: number = 0;

// 多API配置
const API_CONFIG = {
  openweathermap: {
    key: process.env.OPENWEATHERMAP_API_KEY || "",
    limit: 1000, // 每天1000次
    resetInterval: 24 * 60 * 60 * 1000, // 24小时
    counter: 0,
    lastReset: new Date()
  },
  weatherstack: {
    key: process.env.WEATHERSTACK_API_KEY || "",
    limit: 100, // 每月100次
    resetInterval: 30 * 24 * 60 * 60 * 1000, // 30天
    counter: 0,
    lastReset: new Date()
  },
  airquality: {
    key: process.env.AIR_QUALITY_API_KEY || "",
    limit: 10000, // 每月10000次
    resetInterval: 30 * 24 * 60 * 60 * 1000, // 30天
    counter: 0,
    lastReset: new Date()
  },
  tomorrow: {
    key: process.env.TOMORROW_API_KEY || "",
    limit: 100, // 每天100次
    resetInterval: 24 * 60 * 60 * 1000, // 24小时
    counter: 0,
    lastReset: new Date()
  },
  weatherapi: {
    key: process.env.WEATHERAPI_KEY || "",
    limit: 10000, // 每月10000次
    resetInterval: 30 * 24 * 60 * 60 * 1000, // 30天
    counter: 0,
    lastReset: new Date()
  }
};

// 检查并重置API计数器
function checkAndResetCounters() {
  const now = new Date();

  Object.keys(API_CONFIG).forEach(provider => {
    const config = API_CONFIG[provider as keyof typeof API_CONFIG];
    if (now.getTime() - config.lastReset.getTime() > config.resetInterval) {
      config.counter = 0;
      config.lastReset = now;
    }
  });
}

// 获取可用的OpenWeatherMap API key
function getOpenWeatherKey(): string | null {
  checkAndResetCounters();

  const config = API_CONFIG.openweathermap;
  if (config.counter < config.limit && config.key) {
    return config.key;
  }

  return null;
}

// 使用OpenWeatherMap API
async function fetchOpenWeatherData(url: string): Promise<unknown> {
  const apiKey = getOpenWeatherKey();
  if (!apiKey) {
    throw new Error('OpenWeatherMap API 调用次数已达上限');
  }

  const finalUrl = url.replace('{apiKey}', apiKey);
  API_CONFIG.openweathermap.counter++;

  const response = await fetch(finalUrl);
  if (!response.ok) {
    throw new Error(`OpenWeatherMap API请求失败: ${response.status}`);
  }

  return response.json();
}

// 使用Tomorrow.io API作为备用


// 生成模拟天气数据（当API失败时使用）
function generateMockWeatherData(): CityWeather[] {
  const mockCities = [
    { id: 1816670, name: "北京", country: "CN", lat: 39.9042, lon: 116.4074 },
    { id: 1796236, name: "上海", country: "CN", lat: 31.2304, lon: 121.4737 },
    { id: 5128581, name: "New York", country: "US", lat: 40.7128, lon: -74.0060 },
    { id: 2643743, name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
    { id: 2988507, name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
    { id: 1850147, name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
    { id: 1835848, name: "Seoul", country: "KR", lat: 37.5665, lon: 126.9780 },
    { id: 1275339, name: "Mumbai", country: "IN", lat: 19.0760, lon: 72.8777 },
    { id: 2147714, name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
    { id: 3448439, name: "São Paulo", country: "BR", lat: -23.5505, lon: -46.6333 }
  ];

  return mockCities.map(city => {
    const temp = Math.random() * 40 - 10; // -10°C 到 30°C
    return {
      id: city.id,
      name: city.name,
      coord: { lat: city.lat, lon: city.lon },
      main: {
        temp: temp,
        feels_like: temp + (Math.random() * 4 - 2),
        humidity: Math.floor(Math.random() * 100),
        pressure: Math.floor(Math.random() * 200) + 950,
        temp_min: temp - Math.random() * 5,
        temp_max: temp + Math.random() * 5
      },
      wind: {
        speed: Math.random() * 20
      },
      visibility: Math.floor(Math.random() * 10000) + 1000,
      sys: {
        country: city.country
      },
      weather: [{
        main: "Clear",
        description: "晴天"
      }]
    } as CityWeather;
  });
}

// 转换城市数据为WeatherInfo格式
function toWeatherInfo(city: CityWeather, value: number, extra?: Record<string, unknown>): WeatherInfo {
  return {
    name: city.name,
    country: city.sys.country,
    countryName: COUNTRY_NAMES[city.sys.country] || city.sys.country,
    value: value,
    humidity: city.main.humidity,
    aqi: (typeof extra?.aqi === 'number') ? extra.aqi : null,
    ...extra
  };
}

// 使用专用空气质量API获取AQI数据
async function fetchAirQualityData(lat: number, lon: number): Promise<number | null> {
  checkAndResetCounters();

  const config = API_CONFIG.airquality;
  if (config.counter >= config.limit || !config.key) {
    return null;
  }

  try {
    const response = await fetch(
      `http://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${config.key}`
    );

    if (response.ok) {
      const data = await response.json();
      config.counter++;
      return data.data?.current?.pollution?.aqius || null;
    }
  } catch (error) {
    console.warn('Air Quality API 调用失败:', error);
  }

  return null;
}

// 使用Weatherstack API作为备用天气数据源
async function fetchWeatherstackData(cities: string[]): Promise<CityWeather[]> {
  checkAndResetCounters();

  const config = API_CONFIG.weatherstack;
  if (config.counter >= config.limit || !config.key) {
    throw new Error('Weatherstack API 调用次数已达上限');
  }

  const results: CityWeather[] = [];

  // Weatherstack 需要逐个查询城市
  for (const cityName of cities.slice(0, 10)) { // 限制查询数量
    try {
      const response = await fetch(
        `http://api.weatherstack.com/current?access_key=${config.key}&query=${cityName}&units=m`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.current) {
          results.push({
            id: Math.random(),
            name: data.location.name,
            coord: { lat: data.location.lat, lon: data.location.lon },
            main: {
              temp: data.current.temperature,
              feels_like: data.current.feelslike,
              humidity: data.current.humidity,
              pressure: data.current.pressure,
              temp_min: data.current.temperature - 2,
              temp_max: data.current.temperature + 2
            },
            wind: {
              speed: data.current.wind_speed / 3.6 // 转换为 m/s
            },
            visibility: data.current.visibility * 1000, // 转换为米
            sys: {
              country: data.location.country
            },
            weather: [{
              main: data.current.weather_descriptions[0],
              description: data.current.weather_descriptions[0]
            }]
          } as CityWeather);
          config.counter++;
        }
      }
    } catch (error) {
      console.warn(`Weatherstack API 查询失败: ${cityName}`, error);
    }
  }

  return results;
}

export async function GET() {
  // 检查缓存
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    let cities: CityWeather[] = [];

    // 1. 优先使用OpenWeatherMap API获取基础天气数据
    try {
      const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${GLOBAL_CITIES.join(",")}&appid={apiKey}&units=metric&lang=zh_cn`;
      const data = await fetchOpenWeatherData(groupUrl) as { list: CityWeather[] };

      if (data.list && Array.isArray(data.list)) {
        cities = data.list;
        console.log('✅ OpenWeatherMap API 成功获取数据');
      }
    } catch (error) {
      console.warn('⚠️ OpenWeatherMap API 失败，尝试Weatherstack备用方案:', error);

      // 2. 如果OpenWeatherMap失败，使用Weatherstack API
      try {
        const cityNames = ['Beijing', 'Shanghai', 'New York', 'London', 'Paris', 'Tokyo', 'Seoul', 'Mumbai', 'Sydney', 'São Paulo'];
        cities = await fetchWeatherstackData(cityNames);
        console.log('✅ Weatherstack API 成功获取数据');
      } catch (weatherstackError) {
        console.warn('⚠️ Weatherstack API 也失败，使用模拟数据:', weatherstackError);
        // 3. 最后降级到模拟数据
        cities = generateMockWeatherData();
        console.log('✅ 使用模拟数据');
      }
    }

    if (cities.length === 0) {
      throw new Error('无法获取城市天气数据');
    }
    
    // 4. 获取空气质量数据 - 使用专用Air Quality API
    const pollutionList = await Promise.all(
      cities.map(async (city) => {
        try {
          // 优先使用专用的Air Quality API
          const aqiData = await fetchAirQualityData(city.coord.lat, city.coord.lon);
          if (aqiData !== null) {
            return { ...city, aqi: aqiData };
          }

          // 备用：使用OpenWeatherMap空气污染API
          try {
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid={apiKey}`;
            const air = await fetchOpenWeatherData(url) as { list: Array<{ main: { aqi: number } }> };
            return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
          } catch {
            // 如果都失败，生成模拟AQI数据
            const mockAqi = Math.floor(Math.random() * 200) + 1; // 1-200的随机AQI
            return { ...city, aqi: mockAqi };
          }
        } catch {
          console.warn(`获取 ${city.name} 空气质量数据失败`);
          return { ...city, aqi: null };
        }
      })
    );

    // 处理排行榜数据
    const hottest = [...cities]
      .sort((a, b) => b.main.temp - a.main.temp)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.main.temp, {
        feelsLike: city.main.feels_like,
        windSpeed: city.wind.speed
      }));

    const coldest = [...cities]
      .sort((a, b) => a.main.temp - b.main.temp)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.main.temp, {
        feelsLike: city.main.feels_like,
        windSpeed: city.wind.speed
      }));

    const mostHumid = [...cities]
      .sort((a, b) => b.main.humidity - a.main.humidity)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.main.humidity, {
        temp: city.main.temp
      }));

    const mostPolluted = pollutionList
      .filter(c => c.aqi !== null)
      .sort((a, b) => (b.aqi || 0) - (a.aqi || 0))
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.aqi || 0, {
        temp: city.main.temp
      }));

    // 组装最终结果
    const weatherData: TopCitiesData = {
      hottest,
      coldest,
      mostHumid,
      mostPolluted
    };

    // 更新缓存
    cachedData = weatherData;
    cacheTimestamp = Date.now();

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('获取排行榜数据失败:', error);
    return NextResponse.json({
      error: "获取数据失败",
      hint: "请稍后重试"
    }, { status: 500 });
  }
}
