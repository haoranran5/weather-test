import { NextResponse } from "next/server";
import { apiManager } from "@/lib/api-manager";

// 缓存配置 - 延长缓存时间以提高性能
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存
let cachedData: unknown = null;
let cacheTimestamp: number = 0;

// 精选重要城市列表 - 减少到15个主要城市以提高速度
const PRIORITY_CITIES = [
  "Beijing",
  "Shanghai", 
  "Tokyo",
  "Seoul",
  "Mumbai",
  "Delhi",
  "Bangkok",
  "Singapore",
  "New York",
  "Los Angeles",
  "London",
  "Paris",
  "Sydney",
  "São Paulo",
  "Moscow"
];

// 城市中文名映射
const CITY_CHINESE_NAMES: Record<string, string> = {
  "Beijing": "北京",
  "Shanghai": "上海",
  "Tokyo": "东京",
  "Seoul": "首尔",
  "Mumbai": "孟买",
  "Delhi": "新德里",
  "Bangkok": "曼谷",
  "Singapore": "新加坡",
  "New York": "纽约",
  "Los Angeles": "洛杉矶",
  "London": "伦敦",
  "Paris": "巴黎",
  "Sydney": "悉尼",
  "São Paulo": "圣保罗",
  "Moscow": "莫斯科"
};

interface CityWeatherData {
  name: string;
  chineseName: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  localtime: string;
  apiSource: string;
}

// 并发获取城市天气数据
async function fetchCitiesWeatherFast(): Promise<CityWeatherData[]> {
  console.log(`🌍 开始并发获取 ${PRIORITY_CITIES.length} 个城市的天气数据`);
  
  const startTime = Date.now();
  const results: CityWeatherData[] = [];
  
  // 分批并发请求，每批5个城市
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < PRIORITY_CITIES.length; i += batchSize) {
    batches.push(PRIORITY_CITIES.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (city) => {
      try {
        console.log(`🌤️ 获取 ${city} 天气数据`);
        const result = await apiManager.fetchWeatherData(city);
        
        if (result.success && result.data) {
          const data = result.data;
          return {
            name: city,
            chineseName: CITY_CHINESE_NAMES[city] || city,
            country: data.sys?.country || 'Unknown',
            temperature: data.main?.temp || 0,
            feelsLike: data.main?.feels_like || 0,
            humidity: data.main?.humidity || 0,
            condition: data.weather?.[0]?.description || '未知',
            windSpeed: data.wind?.speed || 0,
            pressure: data.main?.pressure || 0,
            visibility: data.visibility || 0,
            localtime: new Date().toISOString(),
            apiSource: result.apiUsed
          };
        }
        return null;
      } catch (error) {
        console.warn(`❌ 获取 ${city} 天气数据失败:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean) as CityWeatherData[]);
    
    // 批次间短暂延迟，避免API限制
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  const endTime = Date.now();
  console.log(`✅ 完成数据获取，耗时: ${endTime - startTime}ms，成功获取 ${results.length} 个城市`);
  
  return results;
}

// 生成排行榜数据
function generateFastRankings(cities: CityWeatherData[]) {
  // 最热城市 TOP 10
  const hottest = cities
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 10)
    .map(city => ({
      name: city.chineseName,
      englishName: city.name,
      country: city.country,
      value: Math.round(city.temperature * 10) / 10,
      feelsLike: Math.round(city.feelsLike * 10) / 10,
      condition: city.condition,
      humidity: city.humidity,
      windSpeed: Math.round(city.windSpeed * 10) / 10,
      localtime: city.localtime,
      apiSource: city.apiSource
    }));

  // 最冷城市 TOP 10
  const coldest = cities
    .sort((a, b) => a.temperature - b.temperature)
    .slice(0, 10)
    .map(city => ({
      name: city.chineseName,
      englishName: city.name,
      country: city.country,
      value: Math.round(city.temperature * 10) / 10,
      feelsLike: Math.round(city.feelsLike * 10) / 10,
      condition: city.condition,
      humidity: city.humidity,
      windSpeed: Math.round(city.windSpeed * 10) / 10,
      localtime: city.localtime,
      apiSource: city.apiSource
    }));

  // 湿度最高 TOP 10
  const mostHumid = cities
    .sort((a, b) => b.humidity - a.humidity)
    .slice(0, 10)
    .map(city => ({
      name: city.chineseName,
      englishName: city.name,
      country: city.country,
      value: city.humidity,
      temperature: Math.round(city.temperature * 10) / 10,
      condition: city.condition,
      localtime: city.localtime,
      apiSource: city.apiSource
    }));

  // 风速最大 TOP 10
  const windiest = cities
    .sort((a, b) => b.windSpeed - a.windSpeed)
    .slice(0, 10)
    .map(city => ({
      name: city.chineseName,
      englishName: city.name,
      country: city.country,
      value: Math.round(city.windSpeed * 10) / 10,
      temperature: Math.round(city.temperature * 10) / 10,
      condition: city.condition,
      localtime: city.localtime,
      apiSource: city.apiSource
    }));

  return {
    hottest,
    coldest,
    mostHumid,
    windiest,
    totalCities: cities.length,
    dataSource: "Multi-API (Fast)",
    lastUpdated: new Date().toISOString(),
    performance: {
      citiesQueried: cities.length,
      cacheStatus: "fresh"
    }
  };
}

export async function GET() {
  try {
    // 检查缓存
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("📋 返回缓存的全球排行榜数据");
      return NextResponse.json({
        ...cachedData,
        performance: {
          ...(cachedData as any).performance,
          cacheStatus: "cached",
          cacheAge: Math.round((now - cacheTimestamp) / 1000 / 60) + " minutes"
        }
      });
    }

    console.log("🔄 开始获取全球排行榜数据（快速版本）");
    const startTime = Date.now();
    
    // 获取城市天气数据
    const cities = await fetchCitiesWeatherFast();
    
    if (cities.length === 0) {
      return NextResponse.json(
        { error: "无法获取城市天气数据" },
        { status: 500 }
      );
    }

    // 生成排行榜
    const rankings = generateFastRankings(cities);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    rankings.performance = {
      ...rankings.performance,
      totalTime: totalTime + "ms",
      averageTimePerCity: Math.round(totalTime / cities.length) + "ms"
    };

    // 更新缓存
    cachedData = rankings;
    cacheTimestamp = now;

    console.log(`✅ 全球排行榜数据获取完成，总耗时: ${totalTime}ms`);
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error("❌ 全球排行榜API错误:", error);
    return NextResponse.json(
      { error: "获取全球排行榜数据失败" },
      { status: 500 }
    );
  }
}
