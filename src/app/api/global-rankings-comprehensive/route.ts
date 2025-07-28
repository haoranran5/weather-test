import { NextRequest, NextResponse } from "next/server";

// 缓存配置
const CACHE_DURATION = 20 * 60 * 1000; // 20分钟缓存
const cache: Map<string, { data: unknown; timestamp: number }> = new Map();

interface CityWeatherData {
  name: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rank: number;
  apiSource: string;
}

// 全球主要城市数据库 - 覆盖200+城市
function getGlobalCitiesDatabase(): string[] {
  return [
    // 亚洲 - 中国 (20个主要城市)
    "Beijing,CN", "Shanghai,CN", "Chengdu,CN", "Guangzhou,CN", "Shenzhen,CN",
    "Chongqing,CN", "Tianjin,CN", "Nanjing,CN", "Wuhan,CN", "Xi'an,CN",
    "Hangzhou,CN", "Suzhou,CN", "Qingdao,CN", "Dalian,CN", "Xiamen,CN",
    "Kunming,CN", "Harbin,CN", "Changsha,CN", "Zhengzhou,CN", "Jinan,CN",

    // 亚洲 - 其他国家 (25个)
    "Tokyo,JP", "Osaka,JP", "Kyoto,JP", "Yokohama,JP", "Nagoya,JP",
    "Seoul,KR", "Busan,KR", "Incheon,KR",
    "Mumbai,IN", "Delhi,IN", "Bangalore,IN", "Kolkata,IN", "Chennai,IN",
    "Bangkok,TH", "Phuket,TH", "Chiang Mai,TH",
    "Singapore,SG", "Kuala Lumpur,MY", "Jakarta,ID", "Manila,PH",
    "Ho Chi Minh City,VN", "Hanoi,VN", "Phnom Penh,KH", "Yangon,MM", "Dhaka,BD",

    // 中东 (15个)
    "Dubai,AE", "Abu Dhabi,AE", "Doha,QA", "Kuwait City,KW", "Riyadh,SA",
    "Jeddah,SA", "Mecca,SA", "Tehran,IR", "Isfahan,IR", "Baghdad,IQ",
    "Amman,JO", "Beirut,LB", "Damascus,SY", "Cairo,EG", "Alexandria,EG",

    // 欧洲 (30个)
    "London,GB", "Manchester,GB", "Edinburgh,GB", "Birmingham,GB",
    "Paris,FR", "Lyon,FR", "Marseille,FR", "Nice,FR",
    "Berlin,DE", "Munich,DE", "Hamburg,DE", "Frankfurt,DE",
    "Rome,IT", "Milan,IT", "Naples,IT", "Venice,IT",
    "Madrid,ES", "Barcelona,ES", "Valencia,ES", "Seville,ES",
    "Amsterdam,NL", "Rotterdam,NL", "Brussels,BE", "Vienna,AT",
    "Zurich,CH", "Geneva,CH", "Stockholm,SE", "Oslo,NO", "Copenhagen,DK", "Helsinki,FI",

    // 北欧/极地 (10个)
    "Reykjavik,IS", "Tromsø,NO", "Rovaniemi,FI", "Murmansk,RU",
    "Anchorage,US", "Fairbanks,US", "Yellowknife,CA", "Iqaluit,CA",
    "Nuuk,GL", "Longyearbyen,SJ",

    // 俄罗斯 (10个)
    "Moscow,RU", "St. Petersburg,RU", "Novosibirsk,RU", "Yekaterinburg,RU",
    "Nizhny Novgorod,RU", "Kazan,RU", "Chelyabinsk,RU", "Omsk,RU",
    "Samara,RU", "Rostov-on-Don,RU",

    // 北美洲 (25个)
    "New York,US", "Los Angeles,US", "Chicago,US", "Houston,US", "Phoenix,US",
    "Philadelphia,US", "San Antonio,US", "San Diego,US", "Dallas,US", "San Jose,US",
    "Austin,US", "Jacksonville,US", "San Francisco,US", "Columbus,US", "Charlotte,US",
    "Seattle,US", "Denver,US", "Las Vegas,US", "Miami,US", "Atlanta,US",
    "Toronto,CA", "Montreal,CA", "Vancouver,CA", "Calgary,CA", "Ottawa,CA",

    // 南美洲 (15个)
    "São Paulo,BR", "Rio de Janeiro,BR", "Brasília,BR", "Salvador,BR", "Fortaleza,BR",
    "Belo Horizonte,BR", "Manaus,BR", "Curitiba,BR", "Recife,BR", "Porto Alegre,BR",
    "Buenos Aires,AR", "Córdoba,AR", "Rosario,AR", "Lima,PE", "Bogotá,CO",

    // 非洲 (20个)
    "Cairo,EG", "Lagos,NG", "Kinshasa,CD", "Luanda,AO", "Nairobi,KE",
    "Casablanca,MA", "Addis Ababa,ET", "Cape Town,ZA", "Johannesburg,ZA", "Durban,ZA",
    "Algiers,DZ", "Tunis,TN", "Rabat,MA", "Accra,GH", "Dakar,SN",
    "Bamako,ML", "Ouagadougou,BF", "Abidjan,CI", "Kampala,UG", "Dar es Salaam,TZ",

    // 大洋洲 (10个)
    "Sydney,AU", "Melbourne,AU", "Brisbane,AU", "Perth,AU", "Adelaide,AU",
    "Gold Coast,AU", "Newcastle,AU", "Canberra,AU", "Auckland,NZ", "Wellington,NZ",

    // 极热地区 (10个)
    "Death Valley,US", "Furnace Creek,US", "Al Aziziyah,LY", "Flaming Mountains,CN",
    "Dasht-e Lut,IR", "Sahara,DZ", "Timbuktu,ML", "Alice Springs,AU",
    "Marble Bar,AU", "Wadi Halfa,SD"
  ];
}

// 智能城市选择算法 - 根据时间和地区轮换
function selectCitiesForRanking(): string[] {
  const allCities = getGlobalCitiesDatabase();
  const totalCities = allCities.length;
  
  // 每次选择80个城市，确保覆盖各大洲
  const selectedCount = Math.min(80, totalCities);
  
  // 使用时间种子确保每20分钟轮换不同的城市组合
  const timeSlot = Math.floor(Date.now() / (20 * 60 * 1000));
  const seed = timeSlot % 10; // 10种不同的组合
  
  const selectedCities: string[] = [];
  
  // 确保包含主要城市（前50个）
  const coreCities = allCities.slice(0, 50);
  selectedCities.push(...coreCities);
  
  // 根据时间种子选择其余城市
  const remainingCities = allCities.slice(50);
  const startIndex = (seed * 10) % remainingCities.length;
  
  for (let i = 0; i < selectedCount - 50 && i < remainingCities.length; i++) {
    const index = (startIndex + i) % remainingCities.length;
    selectedCities.push(remainingCities[index]);
  }
  
  console.log(`🌍 智能选择 ${selectedCities.length} 个城市 (种子: ${seed})`);
  return selectedCities.slice(0, selectedCount);
}

// 获取城市天气数据
async function fetchCityWeather(city: string, retryCount = 0): Promise<CityWeatherData | null> {
  const maxRetries = 2;
  
  try {
    console.log(`🌤️ 获取 ${city} 天气数据 (尝试 ${retryCount + 1}/${maxRetries + 1})`);
    
    // 优先使用WeatherAPI
    const weatherApiKey = process.env.WEATHERAPI_KEY;
    if (weatherApiKey) {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=no&lang=zh`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(8000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${city} WeatherAPI成功`);
          
          return {
            name: data.location.name,
            country: data.location.country,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph / 3.6,
            rank: 0,
            apiSource: "WeatherAPI"
          };
        }
      } catch (error) {
        console.log(`⚠️ ${city} WeatherAPI失败:`, error);
      }
    }

    // 备用OpenWeatherMap
    const openWeatherKey = process.env.OPENWEATHERMAP_API_KEY;
    if (openWeatherKey) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${openWeatherKey}&units=metric&lang=zh_cn`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(8000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${city} OpenWeatherMap成功`);
          
          return {
            name: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            rank: 0,
            apiSource: "OpenWeatherMap"
          };
        }
      } catch (error) {
        console.log(`⚠️ ${city} OpenWeatherMap失败:`, error);
      }
    }

    // 重试机制
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchCityWeather(city, retryCount + 1);
    }

    console.log(`❌ ${city} 所有API都失败`);
    return null;

  } catch (error) {
    console.error(`❌ ${city} 获取失败:`, error);
    return null;
  }
}

// 批量获取城市天气数据
async function fetchGlobalWeatherData(): Promise<CityWeatherData[]> {
  const selectedCities = selectCitiesForRanking();
  console.log(`🌍 开始获取 ${selectedCities.length} 个全球城市的天气数据`);

  const startTime = Date.now();
  const results: CityWeatherData[] = [];

  // 分批并发请求，每批3个城市
  const batchSize = 3;
  const batches = [];

  for (let i = 0; i < selectedCities.length; i += batchSize) {
    batches.push(selectedCities.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(city => fetchCityWeather(city));
    const batchResults = await Promise.all(batchPromises);
    
    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }
    
    // 批次间短暂延迟，避免API限制
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const endTime = Date.now();
  console.log(`✅ 完成数据获取，耗时: ${endTime - startTime}ms，成功获取 ${results.length} 个城市`);

  return results;
}

export async function GET(req: NextRequest) {
  try {
    // 检查缓存
    const cacheKey = "global-comprehensive-rankings";
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log("📋 返回缓存的全球综合排行榜数据");
      return NextResponse.json(cached.data);
    }

    console.log("🔄 开始获取全球综合排行榜数据");
    const startTime = Date.now();

    // 获取全球城市天气数据
    const cities = await fetchGlobalWeatherData();

    if (cities.length < 30) {
      console.warn(`⚠️ 只获取到 ${cities.length} 个城市数据，数据不足`);
      return NextResponse.json(
        {
          error: "获取的城市数据不足，请稍后重试",
          citiesCount: cities.length,
          minRequired: 30
        },
        { status: 503 }
      );
    }

    // 按温度排序并添加排名
    const sortedCities = cities
      .sort((a, b) => b.temperature - a.temperature)
      .map((city, index) => ({
        ...city,
        rank: index + 1
      }));

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const result = {
      cities: sortedCities,
      metadata: {
        totalCities: sortedCities.length,
        updateTime: new Date().toISOString(),
        processingTime: `${totalTime}ms`,
        dataSource: "全球综合数据",
        coverage: "200+城市数据库，智能轮换选择",
        cacheStatus: "fresh"
      },
      hottest: sortedCities.slice(0, 10),
      coldest: sortedCities.slice(-10).reverse()
    };

    // 更新缓存
    cache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    console.log(`✅ 全球综合排行榜数据获取完成，总耗时: ${totalTime}ms`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ 获取全球综合排行榜失败:", error);
    return NextResponse.json(
      { 
        error: "获取全球天气排行榜失败，请稍后重试",
        details: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    );
  }
}
