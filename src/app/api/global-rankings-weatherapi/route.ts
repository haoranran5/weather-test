import { NextResponse } from "next/server";
import { getCityChineseName } from "@/constants/city-translations";
import { getAirQualityAssessment, getEPAAQILevel, getPM25Level } from "@/utils/aqi-utils";

// WeatherAPI.com 配置
const WEATHERAPI_CONFIG = {
  key: process.env.WEATHERAPI_KEY,
  limit: 10000, // 每月10000次
  resetInterval: 30 * 24 * 60 * 60 * 1000, // 30天
  counter: 0,
  lastReset: new Date()
};

// 缓存配置
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
let cachedData: any = null;
let cacheTimestamp: number = 0;

// 全球主要城市列表
const GLOBAL_CITIES = [
  "Beijing,China",
  "Shanghai,China", 
  "Tokyo,Japan",
  "Seoul,South Korea",
  "Mumbai,India",
  "Delhi,India",
  "Bangkok,Thailand",
  "Singapore,Singapore",
  "Jakarta,Indonesia",
  "Manila,Philippines",
  "New York,USA",
  "Los Angeles,USA",
  "Chicago,USA",
  "Miami,USA",
  "Toronto,Canada",
  "Mexico City,Mexico",
  "London,UK",
  "Paris,France",
  "Berlin,Germany",
  "Rome,Italy",
  "Madrid,Spain",
  "Moscow,Russia",
  "Istanbul,Turkey",
  "Cairo,Egypt",
  "Lagos,Nigeria",
  "Johannesburg,South Africa",
  "Sydney,Australia",
  "Melbourne,Australia",
  "Auckland,New Zealand",
  "São Paulo,Brazil",
  "Rio de Janeiro,Brazil",
  "Buenos Aires,Argentina",
  "Lima,Peru",
  "Bogotá,Colombia",
  "Santiago,Chile"
];

// 检查并重置计数器
function checkAndResetCounter() {
  const now = new Date();
  if (now.getTime() - WEATHERAPI_CONFIG.lastReset.getTime() > WEATHERAPI_CONFIG.resetInterval) {
    WEATHERAPI_CONFIG.counter = 0;
    WEATHERAPI_CONFIG.lastReset = now;
  }
}

// 使用WeatherAPI.com获取城市天气数据
async function fetchCityWeather(city: string): Promise<any> {
  checkAndResetCounter();
  
  if (WEATHERAPI_CONFIG.counter >= WEATHERAPI_CONFIG.limit) {
    throw new Error('WeatherAPI.com 调用次数已达上限');
  }
  
  const response = await fetch(
    `http://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_CONFIG.key}&q=${encodeURIComponent(city)}&aqi=yes`
  );
  
  if (!response.ok) {
    throw new Error(`WeatherAPI.com 请求失败: ${response.status}`);
  }
  
  WEATHERAPI_CONFIG.counter++;
  return response.json();
}

// 获取所有城市的天气数据
async function fetchAllCitiesWeather(): Promise<any[]> {
  const results = [];
  const batchSize = 5; // 每批处理5个城市，避免过快请求
  
  for (let i = 0; i < GLOBAL_CITIES.length; i += batchSize) {
    const batch = GLOBAL_CITIES.slice(i, i + batchSize);
    const batchPromises = batch.map(async (city) => {
      try {
        const data = await fetchCityWeather(city);
        return {
          name: getCityChineseName(data.location.name),
          englishName: data.location.name,
          region: data.location.region,
          country: data.location.country,
          temperature: data.current.temp_c,
          feelsLike: data.current.feelslike_c,
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          pressure: data.current.pressure_mb,
          visibility: data.current.vis_km,
          uv: data.current.uv,
          airQuality: data.current.air_quality ? {
            usEpaIndex: data.current.air_quality["us-epa-index"],
            pm2_5: data.current.air_quality.pm2_5,
            pm10: data.current.air_quality.pm10,
            co: data.current.air_quality.co,
            no2: data.current.air_quality.no2,
            o3: data.current.air_quality.o3
          } : null,
          localtime: data.location.localtime
        };
      } catch (error) {
        console.warn(`获取 ${city} 天气数据失败:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(result => result !== null));
    
    // 批次间延迟，避免API限制
    if (i + batchSize < GLOBAL_CITIES.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// 生成排行榜数据
function generateRankings(cities: any[]) {
  // 最热城市 TOP 10
  const hottest = cities
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 10)
    .map(city => ({
      name: city.name,
      englishName: city.englishName,
      country: city.country,
      region: city.region,
      value: Math.round(city.temperature * 10) / 10,
      feelsLike: Math.round(city.feelsLike * 10) / 10,
      condition: city.condition,
      humidity: city.humidity,
      windSpeed: Math.round(city.windSpeed * 10) / 10,
      localtime: city.localtime
    }));

  // 最冷城市 TOP 10
  const coldest = cities
    .sort((a, b) => a.temperature - b.temperature)
    .slice(0, 10)
    .map(city => ({
      name: city.name,
      englishName: city.englishName,
      country: city.country,
      region: city.region,
      value: Math.round(city.temperature * 10) / 10,
      feelsLike: Math.round(city.feelsLike * 10) / 10,
      condition: city.condition,
      humidity: city.humidity,
      windSpeed: Math.round(city.windSpeed * 10) / 10,
      localtime: city.localtime
    }));

  // 污染最严重城市 TOP 10 (基于综合评分)
  const mostPolluted = cities
    .filter(city => city.airQuality && city.airQuality.usEpaIndex)
    .map(city => {
      const aqiIndex = city.airQuality.usEpaIndex;
      const pm25 = city.airQuality.pm2_5;
      const airQualityAssessment = getAirQualityAssessment(aqiIndex, pm25);
      const epaLevel = getEPAAQILevel(aqiIndex);
      const pm25Level = getPM25Level(pm25);

      return {
        name: city.name,
        englishName: city.englishName,
        country: city.country,
        region: city.region,
        value: aqiIndex,
        pm2_5: Math.round(pm25 * 10) / 10,
        pm10: Math.round(city.airQuality.pm10 * 10) / 10,
        temperature: Math.round(city.temperature * 10) / 10,
        condition: city.condition,
        localtime: city.localtime,
        airQualityLevel: airQualityAssessment.overallLevel,
        airQualityColor: airQualityAssessment.color,
        airQualityBg: airQualityAssessment.bgColor,
        airQualityDescription: airQualityAssessment.description,
        airQualityDetails: airQualityAssessment.details,
        airQualityScore: airQualityAssessment.score,
        epaLevel: epaLevel.level,
        pm25Level: pm25Level.level
      };
    })
    .sort((a, b) => b.airQualityScore - a.airQualityScore) // 按综合评分排序
    .slice(0, 10);

  return {
    hottest,
    coldest,
    mostPolluted,
    totalCities: cities.length,
    dataSource: 'WeatherAPI.com',
    lastUpdated: new Date().toISOString(),
    apiUsage: {
      callsUsed: WEATHERAPI_CONFIG.counter,
      callsLimit: WEATHERAPI_CONFIG.limit,
      resetTime: new Date(WEATHERAPI_CONFIG.lastReset.getTime() + WEATHERAPI_CONFIG.resetInterval).toISOString()
    }
  };
}

export async function GET() {
  // 检查缓存
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    console.log('开始获取全球城市天气数据...');
    const cities = await fetchAllCitiesWeather();
    
    if (cities.length === 0) {
      throw new Error('未能获取任何城市的天气数据');
    }
    
    console.log(`成功获取 ${cities.length} 个城市的天气数据`);
    
    const rankings = generateRankings(cities);
    
    // 更新缓存
    cachedData = rankings;
    cacheTimestamp = now;
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error('获取全球排行榜数据失败:', error);
    
    // 如果有缓存数据，返回缓存数据
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        error: '数据更新失败，显示缓存数据',
        cacheTime: new Date(cacheTimestamp).toISOString()
      });
    }
    
    // 返回错误信息
    return NextResponse.json({
      error: "获取全球排行榜数据失败",
      details: error instanceof Error ? error.message : String(error),
      apiUsage: {
        callsUsed: WEATHERAPI_CONFIG.counter,
        callsLimit: WEATHERAPI_CONFIG.limit
      }
    }, { status: 500 });
  }
}
