import { NextResponse } from "next/server";

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
    pressure: number;
    feels_like: num         .map(city => toWeatherInfo(city, city.main.humidity, { temp: city.main.temp }));.map(city => toWeatherInfo(city, city.main.humidity, {
        windSpeed: city.wind.speed,
        temp: undefined
      }));;
  };
  sys: {
    country: string;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
}

interface CityWithAQI extends CityWeather {
  aqi: number | null;
}

// 国家代码映射
const COUNTRY_NAMES: { [key: string]: string } = {
  'CN': '中国',
  'US': '美国',
  'GB': '英国',
  'JP': '日本',
  'KR': '韩国',
  'SG': '新加坡',
  'TH': '泰国',
  'IN': '印度',
  'AU': '澳大利亚',
  'RU': '俄罗斯',
  'TR': '土耳其',
  'EG': '埃及',
  'AE': '阿联酋',
  'ZA': '南非',
  'BR': '巴西',
  'AR': '阿根廷',
  'CA': '加拿大',
  'NL': '荷兰',
  'ES': '西班牙',
  'IT': '意大利',
  'GR': '希腊',
  'FR': '法国',
  'DE': '德国'
};

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

// 添加错误重试机制和详细的错误处理
async function fetchWithRetry(url: string, retries = 3) {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      // 检查API响应中的具体错误
      if (data.cod && data.cod !== 200) {
        const errorMsg = data.message || '未知错误';
        if (data.cod === 401) {
          throw new Error(`API认证失败: ${errorMsg}`);
        }
        throw new Error(`API错误 (${data.cod}): ${errorMsg}`);
      }
      
      if (!res.ok) {
        throw new Error(`HTTP错误: ${res.status} ${res.statusText}`);
      }
      
      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // 如果是API认证错误，立即返回
      if (lastError.message.includes('API认证失败')) {
        throw lastError;
      }
      
      // 最后一次重试失败
      if (i === retries - 1) {
        console.error(`请求失败 (重试 ${retries} 次后)：`, url, lastError);
        throw lastError;
      }
      
      // 等待后重试，使用指数退避策略
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError || new Error('达到最大重试次数');
}

// 简单内存缓存，5分钟更新一次
let cache: TopCitiesResponse | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export async function GET() {
  if (!API_KEY) {
    console.error('API_KEY is missing:', API_KEY);
    return NextResponse.json({ error: "API key 配置错误" }, { status: 500 });
  }
  
  // 检查缓存
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cache);
  }
  
  try {
    // 验证API key格式
    if (typeof API_KEY !== 'string' || API_KEY.length !== 32) {
      console.error('Invalid API key format:', API_KEY);
      return NextResponse.json({
        error: "API key 格式错误，请确保是32位的有效密钥",
        hint: "请在 .env.local 文件中正确设置 OPENWEATHERMAP_API_KEY"
      }, { status: 400 });
    }

    // 先测试API key是否有效 - 使用单个城市测试
    const testUrl = `https://api.openweathermap.org/data/2.5/weather?id=1816670&appid=${API_KEY}&units=metric`;
    console.log('正在验证 API key...');
    
    try {
      const testData = await fetchWithRetry(testUrl);
      console.log('API key 验证成功');
    } catch (error) {
      console.error('API key 验证失败:', error);
      if (error instanceof Error && error.message.includes('API认证失败')) {
        return NextResponse.json({
          error: "API key 无效，请检查 OpenWeatherMap API key 是否正确",
          details: error.message,
          hint: "请确保在 OpenWeatherMap 网站激活了您的 API key，并且有足够的配额"
        }, { status: 401 });
      }
      return NextResponse.json({
        error: "API 验证失败",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
    console.log('API key test successful, proceeding with batch request...');
    
    // 批量获取城市天气
    const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${CITY_LIST.join(",")}&appid=${API_KEY}&units=metric&lang=zh_cn`;
    console.log('Making batch request...');
    const res = await fetch(groupUrl);
    if (!res.ok) {
      console.error('Batch weather API error:', res.status, res.statusText);
      return NextResponse.json({ error: `获取城市天气失败 (${res.status})` }, { status: 500 });
    }
    const data = await res.json();
    const cities: CityWeather[] = data.list;
    
    // 获取空气质量数据
    const pollutionPromises = cities.map(async (city: CityWeather): Promise<CityWithAQI> => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${API_KEY}`;
        const air = await fetchWithRetry(url);
        return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
      } catch (error) {
        console.warn(`无法获取 ${city.name} 的空气质量数据:`, error);
        return { ...city, aqi: null };
      }
    });
    
    const pollutionList = await Promise.all(pollutionPromises);
    
    // 转换函数
    const toWeatherInfo = (
      city: CityWeather | CityWithAQI,
      value: number,
      extraData?: { 
        windSpeed?: number;
        pressure?: number;
        visibility?: number;
        feelsLike?: number;
        temp?: number;
      }
    ): WeatherInfo => ({
      name: city.name,
      country: city.sys.country,
      countryName: COUNTRY_NAMES[city.sys.country] || city.sys.country,
      value,
      extra: extraData
    });

    // 处理各种排行榜数据
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

    const windiest = [...cities]
      .sort((a, b) => b.wind.speed - a.wind.speed)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.wind.speed, {
        windSpeed: city.wind.speed,
        temp: city.main.temp
      }));

    const lowestPressure = [...cities]
      .sort((a, b) => a.main.pressure - b.main.pressure)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.main.pressure, {
        pressure: city.main.pressure,
        temp: city.main.temp
      }));

    const lowVisibility = [...cities]
      .sort((a, b) => a.visibility - b.visibility)
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.visibility, {
        visibility: city.visibility,
        temp: city.main.temp
      }));

    const mostPolluted = pollutionList
      .filter(c => c.aqi !== null)
      .sort((a, b) => (b.aqi || 0) - (a.aqi || 0))
      .slice(0, 10)
      .map(city => toWeatherInfo(city, city.aqi || 0, {
        temp: city.main.temp
      }));

    const result: TopCitiesResponse = {
      hottest,
      coldest,
      mostHumid,
      mostPolluted,
      windiest,
      lowestPressure,
      lowVisibility
    };
    cache = result;
    cacheTime = now;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Top cities API error:', error);
    return NextResponse.json({ error: "获取城市排行榜失败" }, { status: 500 });
  }
} 