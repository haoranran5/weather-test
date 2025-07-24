import { NextRequest, NextResponse } from "next/server";

// 全球主要城市ID（可根据需要扩展）
const CITY_LIST = [
  1816670, // 北京
  1796236, // 上海
  5128581, // 纽约
  2643743, // 伦敦
  2968815, // 巴黎
  1850147, // 东京
  2147714, // 悉尼
  524901,  // 莫斯科
  360630,  // 开罗
  1275339, // 孟买
  3448439, // 圣保罗
  5368361, // 洛杉矶
  6167865, // 多伦多
  292223,  // 迪拜
  993800,  // 约翰内斯堡
  1880252, // 新加坡
  1835848, // 首尔
  1819729, // 香港
  1609350, // 曼谷
  2644210, // 利物浦
  745044,  // 伊斯坦布尔
  1853909, // 大阪
  1273294, // 德里
  1792947, // 广州
  1795565, // 深圳
  344979,  // 亚的斯亚贝巴
  3435910, // 布宜诺斯艾利斯
  292968,  // 阿布扎比
  6160752, // 渥太华
  1815286  // 重庆
];

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// 简单内存缓存，10分钟更新一次
let cache: any = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key 配置错误" }, { status: 500 });
  }
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cache);
  }
  // 批量获取城市天气
  const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${CITY_LIST.join(",")}&appid=${API_KEY}&units=metric&lang=zh_cn`;
  const res = await fetch(groupUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "获取城市天气失败" }, { status: 500 });
  }
  const data = await res.json();
  const cities = data.list;
  // 最热
  const hottest = [...cities].sort((a, b) => b.main.temp - a.main.temp).slice(0, 10);
  // 最冷
  const coldest = [...cities].sort((a, b) => a.main.temp - b.main.temp).slice(0, 10);
  // 湿度最高
  const mostHumid = [...cities].sort((a, b) => b.main.humidity - a.main.humidity).slice(0, 10);
  // 空气污染（用AQI，OpenWeatherMap只支持经纬度，取这些城市的第一个空气质量数据）
  const pollutionPromises = cities.map(async (city: any) => {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return { ...city, aqi: null };
    const air = await res.json();
    return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
  });
  const pollutionList = await Promise.all(pollutionPromises);
  // aqi: 1优 2良 3轻度污染 4中度污染 5重度污染
  const mostPolluted = pollutionList.filter(c => c.aqi != null).sort((a, b) => b.aqi - a.aqi).slice(0, 10);

  const result = {
    hottest: hottest.map(city => ({ name: city.name, country: city.sys.country, temp: city.main.temp })),
    coldest: coldest.map(city => ({ name: city.name, country: city.sys.country, temp: city.main.temp })),
    mostHumid: mostHumid.map(city => ({ name: city.name, country: city.sys.country, humidity: city.main.humidity })),
    mostPolluted: mostPolluted.map(city => ({ name: city.name, country: city.sys.country, aqi: city.aqi })),
  };
  cache = result;
  cacheTime = now;
  return NextResponse.json(result);
} 