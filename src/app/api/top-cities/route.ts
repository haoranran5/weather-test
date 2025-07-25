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
    feels_like: number;
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

// API提供商类型
type APIProvider = 'openweathermap' | 'weatherstack' | 'weatherbit';

// API密钥配置
const API_KEYS = {
  openweathermap: [
    process.env.OPENWEATHERMAP_API_KEY,
    process.env.OPENWEATHERMAP_API_KEY_BACKUP
  ].filter(Boolean) as string[],
  weatherstack: [
    process.env.WEATHERSTACK_API_KEY
  ].filter(Boolean) as string[],
  weatherbit: [
    process.env.WEATHERBIT_API_KEY
  ].filter(Boolean) as string[]
};

// API提供商的限制类型
type LimitType = 'daily' | 'monthly' | 'none';

// API限制配置
interface APILimit {
  limit: number;
  type: LimitType;
}

// 每个API提供商的请求限制
const API_LIMITS: Record<APIProvider, APILimit> = {
  openweathermap: { limit: Infinity, type: 'none' }, // OpenWeatherMap没有严格限制
  weatherstack: { limit: 100, type: 'monthly' }, // Weatherstack每月100次
  weatherbit: { limit: 50, type: 'daily' } // Weatherbit每天50次
};

// 记录API调用次数
const API_CALLS: Record<APIProvider, number> = {
  openweathermap: 0,
  weatherstack: 0,
  weatherbit: 0
};

// 上次重置计数器的时间
const LAST_RESET: Record<APIProvider, Date> = {
  openweathermap: new Date(),
  weatherstack: new Date(),
  weatherbit: new Date()
};

// 用于记录当前使用的API key索引
const currentApiKeyIndex: Record<APIProvider, number> = {
  openweathermap: 0,
  weatherstack: 0,
  weatherbit: 0
};

// 检查并更新API调用计数
function checkAndUpdateApiLimit(provider: APIProvider): boolean {
  const now = new Date();
  const limitConfig = API_LIMITS[provider];
  const lastReset = LAST_RESET[provider];

  // 根据限制类型检查是否需要重置计数器
  let needsReset = false;
  switch (limitConfig.type) {
    case 'daily':
      needsReset = now.getDate() !== lastReset.getDate() ||
                  now.getMonth() !== lastReset.getMonth() ||
                  now.getFullYear() !== lastReset.getFullYear();
      break;
    case 'monthly':
      needsReset = now.getMonth() !== lastReset.getMonth() ||
                  now.getFullYear() !== lastReset.getFullYear();
      break;
    case 'none':
      return true; // 无限制的API直接返回true
  }

  if (needsReset) {
    API_CALLS[provider] = 0;
    LAST_RESET[provider] = now;
  }

  // 检查是否超出限制
  if (API_CALLS[provider] >= limitConfig.limit) {
    const limitType = limitConfig.type === 'daily' ? '今日' : '本月';
    console.warn(`服务访问受限`);
    return false;
  }

  API_CALLS[provider]++;
  console.log(`服务使用状态正常`);
  return true;
}

// 获取下一个可用的API key
function getNextApiKey(provider: APIProvider): string | null {
  const keys = API_KEYS[provider];
  const index = currentApiKeyIndex[provider];
  const key = keys[index];
  // 循环使用API keys
  currentApiKeyIndex[provider] = (index + 1) % keys.length;
  return key || null;
}

// 使用特定的API key进行请求
async function fetchWithKey(url: string, provider: APIProvider = 'openweathermap', retries = 3): Promise<any> {
  const initialKeyIndex = currentApiKeyIndex[provider];
  let lastError: Error | null = null;

  // 检查API限制
  if (!checkAndUpdateApiLimit(provider)) {
    throw new Error(`${provider} API 已达到本月使用限制`);
  }

  // 尝试所有可用的API keys
  for (let i = 0; i < API_KEYS[provider].length; i++) {
    const apiKey = getNextApiKey(provider);
    if (!apiKey) continue;

    const urlWithKey = url.replace(/{apiKey}/g, apiKey);
    try {
      const result = await fetchWithRetry(urlWithKey, retries);
      console.log(`API请求成功`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API请求失败，尝试下一个服务`);
      continue;
    }
  }

  // 重置到初始的API key索引
  currentApiKeyIndex[provider] = initialKeyIndex;
  throw lastError || new Error(`所有${provider} API密钥都无效`);
}

// 转换天气数据的工具函数
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

// 添加错误重试机制和详细的错误处理
async function fetchWithRetry(url: string, retries = 3) {
  let lastError: Error | null = null;
      console.log(`正在请求天气数据...`);
  
  for (let i = 0; i < retries; i++) {
    try {
      // 添加超时设置
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`请求超时，正在重试`);
      }, 30000); // 增加超时时间到30秒

      console.log(`第 ${i + 1} 次尝试`);      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 0 }, // 禁用缓存
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherTest/1.0'
        }
      });

      clearTimeout(timeoutId);

      // 确保我们能读取响应体
      const text = await res.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`数据解析失败`);
      }
      
      // 检查响应状态
      if (!res.ok || (data.cod && data.cod !== 200)) {
        throw new Error(`请求失败`);
      }
      
      console.log(`数据获取成功`);
      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // 如果是API认证错误，立即返回
      if (lastError.message.includes('API认证失败')) {
        throw lastError;
      }
      
      // 最后一次重试失败
      if (i === retries - 1) {
        console.error(`数据请求失败`);
        throw lastError;
      }
      
      // 等待后重试，使用较长的固定延迟
      const delay = 5000; // 固定5秒延迟
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError || new Error('达到最大重试次数');
}

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const CACHE_STALE_DURATION = 30 * 60 * 1000; // 30分钟过期

interface CacheData {
  data: TopCitiesResponse;
  timestamp: number;
  lastError?: {
    message: string;
    time: number;
  };
}

let cache: CacheData | null = null;

// 更新缓存的函数
async function updateCache(): Promise<CacheData> {
  const fetchStart = Date.now();
  
  // 验证是否有可用的API key
  if (API_KEYS.openweathermap.length === 0 && API_KEYS.weatherstack.length === 0) {
    throw new Error('未配置任何API key，请检查环境变量配置');
  }

  try {
    // 获取城市天气数据
    const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${CITY_LIST.join(",")}&appid={apiKey}&units=metric&lang=zh_cn`;
    const data = await fetchWithKey(groupUrl);
    
    if (!data.list || !Array.isArray(data.list)) {
      throw new Error('API返回数据格式错误');
    }
    
    const cities: CityWeather[] = data.list;
    
    // 获取空气质量数据
    const pollutionList = await Promise.all(
      cities.map(async (city) => {
        try {
          const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid={apiKey}`;
          const air = await fetchWithKey(url);
          return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
        } catch (error) {
          console.warn(`空气质量数据暂时不可用`);
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

    // 组装最终结果
    const weatherData: TopCitiesResponse = {
      hottest,
      coldest,
      mostHumid,
      mostPolluted,
      windiest,
      lowestPressure,
      lowVisibility
    };

    // 更新缓存
    const newCache: CacheData = {
      data: weatherData,
      timestamp: fetchStart
    };
    
    cache = newCache;
    return newCache;
  } catch (error) {
    // 如果更新失败，记录错误并抛出
    console.error('缓存更新失败:', error);
    throw error;
  }
}

export async function GET() {
    if (API_KEYS.openweathermap.length === 0 && API_KEYS.weatherstack.length === 0) {
      console.error('系统配置不完整');
      return NextResponse.json({ 
        error: "系统维护中",
        hint: "请稍后再试"
      }, { status: 500 });
    }  const now = Date.now();
  
  // 检查缓存
  if (cache) {
    const age = now - cache.timestamp;
    
    // 如果缓存新鲜，直接返回
    if (age < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }
    
    // 如果缓存过期但未完全失效，先返回缓存数据，同时在后台更新
    if (age < CACHE_STALE_DURATION) {
      // 异步更新缓存
      updateCache().catch(error => {
        console.error('后台缓存更新失败:', error);
        cache!.lastError = {
          message: error instanceof Error ? error.message : String(error),
          time: Date.now()
        };
      });
      
      // 返回稍旧的数据
      return NextResponse.json({
        ...cache.data,
        _cached: true,
        _cacheAge: Math.round(age / 1000)
      });
    }
  }
  
  try {
    // 验证API key格式
    // 测试可用的API服务
    console.log('正在连接天气服务...');
    
    async function testAPI(provider: APIProvider): Promise<boolean> {
      try {
        let testUrl;
        switch (provider) {
          case 'openweathermap':
            testUrl = `https://api.openweathermap.org/data/2.5/weather?id=1816670&appid={apiKey}&units=metric`;
            break;
          case 'weatherstack':
            testUrl = `http://api.weatherstack.com/current?access_key={apiKey}&query=Beijing`;
            break;
          case 'weatherbit':
            testUrl = `https://api.weatherbit.io/v2.0/current?city=Beijing&key={apiKey}`;
            break;
        }
        
        await fetchWithKey(testUrl, provider);
        console.log(`服务连接成功`);
        return true;
      } catch (error) {
        console.warn(`服务暂时不可用`);
        return false;
      }
    }

    // 优先测试 OpenWeatherMap API
    const openweatherValid = await testAPI('openweathermap');
    
    // 只有当 OpenWeatherMap 不可用时才测试 Weatherstack
    let weatherstackValid = false;
    if (!openweatherValid && API_KEYS.weatherstack.length > 0) {
      weatherstackValid = await testAPI('weatherstack');
    }

    if (!openweatherValid && !weatherstackValid) {
      console.error('服务暂时不可用');
      return NextResponse.json({
        error: "天气服务暂时不可用",
        hint: "请稍后再试"
      }, { status: 500 });
    }
    
    console.log('服务认证成功');
    
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
    
    // 批量获取城市天气
    const groupUrl = `https://api.openweathermap.org/data/2.5/group?id=${CITY_LIST.join(",")}&appid={apiKey}&units=metric&lang=zh_cn`;
    console.log('正在获取批量城市天气数据...');
    
    let data;
    try {
      data = await fetchWithKey(groupUrl, 'openweathermap');
      console.log('成功获取城市天气数据');
    } catch (error) {
      console.error('数据同步失败');
      return NextResponse.json({
        error: "获取城市天气失败",
        details: error instanceof Error ? error.message : String(error),
        hint: "请检查网络连接和API配额"
      }, { status: 500 });
    }
    
    if (!data.list || !Array.isArray(data.list)) {
      console.error('城市天气数据格式错误:', data);
      return NextResponse.json({
        error: "API返回数据格式错误",
        hint: "请联系技术支持"
      }, { status: 500 });
    }
    
    const cities: CityWeather[] = data.list;
    
    // 获取空气质量数据
    const pollutionPromises = cities.map(async (city: CityWeather): Promise<CityWithAQI> => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.coord.lat}&lon=${city.coord.lon}&appid={apiKey}`;
        const air = await fetchWithKey(url, 'openweathermap');
        return { ...city, aqi: air.list?.[0]?.main?.aqi ?? null };
      } catch (error) {
        console.warn(`无法获取 ${city.name} 的空气质量数据:`, error);
        return { ...city, aqi: null };
      }
    });
    
    const pollutionList = await Promise.all(pollutionPromises);
    
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

    const weatherData: TopCitiesResponse = {
      hottest,
      coldest,
      mostHumid,
      mostPolluted,
      windiest,
      lowestPressure,
      lowVisibility
    };

    // 更新缓存
    cache = {
      data: weatherData,
      timestamp: now
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('数据获取失败');
    return NextResponse.json({ 
      error: "数据暂时不可用",
      hint: "请稍后再试"
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
} 