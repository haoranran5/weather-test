import { NextRequest, NextResponse } from "next/server";

// 定义城市天气数据类型
interface CityWeather {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    humidity: number;
  };
  sys: {
    country: string;
  };
}

interface CityWithAQI extends CityWeather {
  aqi: number | null;
}

interface TopCitiesResponse {
  hottest: Array<{ name: string; country: string; temp: number }>;
  coldest: Array<{ name: string; country: string; temp: number }>;
  mostHumid: Array<{ name: string; country: string; humidity: number }>;
  mostPolluted: Array<{ name: string; country: string; aqi: number }>;
}

// 全球主要城市ID（可根据需要扩展）
const CITY_LIST = [
  1816670, // 北京 Beijing
  1796236, // 上海 Shanghai
  1795565, // 深圳 Shenzhen
  1815286, // 重庆 Chongqing
  1792947, // 广州 Guangzhou
  1808926, // 杭州 Hangzhou
  1795270, // 成都 Chengdu
  5128581, // 纽约 New York
  5368361, // 洛杉矶 Los Angeles
  4887398, // 芝加哥 Chicago
  2643743, // 伦敦 London
  2968815, // 巴黎 Paris
  2950159, // 柏林 Berlin
  1850147, // 东京 Tokyo
  1853909, // 大阪 Osaka
  1835848, // 首尔 Seoul
  1819729, // 香港 Hong Kong
  1880252, // 新加坡 Singapore
  1609350, // 曼谷 Bangkok
  1275339, // 孟买 Mumbai
  1273294, // 德里 Delhi
  2147714, // 悉尼 Sydney
  2158177, // 墨尔本 Melbourne
  524901,  // 莫斯科 Moscow
  745044,  // 伊斯坦布尔 Istanbul
  360630,  // 开罗 Cairo
  292223,  // 迪拜 Dubai
  993800,  // 约翰内斯堡 Johannesburg
  3448439, // 圣保罗 São Paulo
  3435910, // 布宜诺斯艾利斯 Buenos Aires
  6167865, // 多伦多 Toronto
  5809844, // 西雅图 Seattle
  2759794, // 阿姆斯特丹 Amsterdam
  3117735, // 马德里 Madrid
  3173435, // 米兰 Milan
  264371   // 雅典 Athens
];

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// 简单内存缓存，10分钟更新一次
let cache: TopCitiesResponse | null = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key 配置错误" }, { status: 500 });
  }
  
  // 检查缓存
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cache);
  }
  
  try {
    // 批量获取城市天气
    const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${CITY_LIST.join(",")}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    const res = await fetch(groupUrl);
    if (!res.ok) {
      console.error('Weather API error:', res.status, res.statusText);
      return NextResponse.json({ error: `获取城市天气失败 (${res.status})` }, { status: 500 });
    }
    const data = await res.json();
    const cities: CityWeather[] = data.list;
    // 最热
    const hottest = [...cities].sort((a, b) => b.main.temp - a.main.temp).slice(0, 10);
    // 最冷
    const coldest = [...cities].sort((a, b) => a.main.temp - b.main.temp).slice(0, 10);
    // 湿度最高
    const mostHumid = [...cities].sort((a, b) => b.main.humidity - a.main.humidity).slice(0, 10);
    // 空气污染（用AQI，OpenWeatherMap只支持经纬度，取这些城市的第一个空气质量数据）
    const pollutionPromises = cities.map(async (city: CityWeather): Promise<CityWithAQI> => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return { ...city, aqi: null };
        const air = await res.json();
        return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
      } catch {
        return { ...city, aqi: null };
      }
    });
    const pollutionList = await Promise.all(pollutionPromises);
    // aqi: 1优 2良 3轻度污染 4中度污染 5重度污染
    const mostPolluted = pollutionList.filter(c => c.aqi !== null).sort((a, b) => (b.aqi || 0) - (a.aqi || 0)).slice(0, 10);

    const result: TopCitiesResponse = {
      hottest: hottest.map(city => ({ name: city.name, country: city.sys.country, temp: city.main.temp })),
      coldest: coldest.map(city => ({ name: city.name, country: city.sys.country, temp: city.main.temp })),
      mostHumid: mostHumid.map(city => ({ name: city.name, country: city.sys.country, humidity: city.main.humidity })),
      mostPolluted: mostPolluted.map(city => ({ name: city.name, country: city.sys.country, aqi: city.aqi || 0 })),
    };
    cache = result;
    cacheTime = now;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Top cities API error:', error);
    return NextResponse.json({ error: "获取城市排行榜失败" }, { status: 500 });
  }
} 