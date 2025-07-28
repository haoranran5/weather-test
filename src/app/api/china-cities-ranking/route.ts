import { NextRequest, NextResponse } from "next/server";

// 缓存配置
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存
const cache: Map<string, { data: unknown; timestamp: number }> = new Map();

interface CityWeatherData {
  name: string;
  province: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rank: number;
  apiSource: string;
}

// 中国所有主要城市数据库 - 包含所有省会城市和重要地级市
function getAllChinaCities(): string[] {
  return [
    // 直辖市 (4个)
    "Beijing,CN", "Shanghai,CN", "Tianjin,CN", "Chongqing,CN",
    
    // 省会城市 (27个)
    "Harbin,CN", "Changchun,CN", "Shenyang,CN", "Shijiazhuang,CN",
    "Taiyuan,CN", "Hohhot,CN", "Jinan,CN", "Nanjing,CN", "Hangzhou,CN",
    "Hefei,CN", "Fuzhou,CN", "Nanchang,CN", "Zhengzhou,CN", "Wuhan,CN",
    "Changsha,CN", "Guangzhou,CN", "Nanning,CN", "Haikou,CN", "Chengdu,CN",
    "Guiyang,CN", "Kunming,CN", "Lhasa,CN", "Xi'an,CN", "Lanzhou,CN",
    "Xining,CN", "Yinchuan,CN", "Urumqi,CN",
    
    // 特别行政区 (2个)
    "Hong Kong,HK", "Macau,MO",
    
    // 副省级城市和计划单列市 (15个)
    "Dalian,CN", "Qingdao,CN", "Ningbo,CN", "Xiamen,CN", "Shenzhen,CN",
    "Guangzhou,CN", "Wuhan,CN", "Chengdu,CN", "Xi'an,CN", "Shenyang,CN",
    "Harbin,CN", "Changchun,CN", "Jinan,CN", "Nanjing,CN", "Hangzhou,CN",
    
    // 重要地级市 - 华北地区 (20个)
    "Tangshan,CN", "Qinhuangdao,CN", "Handan,CN", "Xingtai,CN", "Baoding,CN",
    "Zhangjiakou,CN", "Chengde,CN", "Cangzhou,CN", "Langfang,CN", "Hengshui,CN",
    "Datong,CN", "Yangquan,CN", "Changzhi,CN", "Jincheng,CN", "Shuozhou,CN",
    "Jinzhong,CN", "Yuncheng,CN", "Xinzhou,CN", "Linfen,CN", "Luliang,CN",
    
    // 重要地级市 - 东北地区 (25个)
    "Anshan,CN", "Fushun,CN", "Benxi,CN", "Dandong,CN", "Jinzhou,CN",
    "Yingkou,CN", "Fuxin,CN", "Liaoyang,CN", "Panjin,CN", "Tieling,CN",
    "Chaoyang,CN", "Huludao,CN", "Jilin,CN", "Siping,CN", "Liaoyuan,CN",
    "Tonghua,CN", "Baishan,CN", "Songyuan,CN", "Baicheng,CN", "Yanbian,CN",
    "Qiqihar,CN", "Jixi,CN", "Hegang,CN", "Shuangyashan,CN", "Daqing,CN",
    
    // 重要地级市 - 华东地区 (40个)
    "Zibo,CN", "Zaozhuang,CN", "Dongying,CN", "Yantai,CN", "Weifang,CN",
    "Jining,CN", "Tai'an,CN", "Weihai,CN", "Rizhao,CN", "Laiwu,CN",
    "Linyi,CN", "Dezhou,CN", "Liaocheng,CN", "Binzhou,CN", "Heze,CN",
    "Xuzhou,CN", "Changzhou,CN", "Suzhou,CN", "Nantong,CN", "Lianyungang,CN",
    "Huai'an,CN", "Yancheng,CN", "Yangzhou,CN", "Zhenjiang,CN", "Taizhou,CN",
    "Suqian,CN", "Wuxi,CN", "Shaoxing,CN", "Wenzhou,CN", "Jiaxing,CN",
    "Huzhou,CN", "Jinhua,CN", "Quzhou,CN", "Zhoushan,CN", "Taizhou,CN",
    "Lishui,CN", "Wuhu,CN", "Bengbu,CN", "Huainan,CN", "Ma'anshan,CN",
    
    // 重要地级市 - 华中地区 (30个)
    "Kaifeng,CN", "Luoyang,CN", "Pingdingshan,CN", "Anyang,CN", "Hebi,CN",
    "Xinxiang,CN", "Jiaozuo,CN", "Puyang,CN", "Xuchang,CN", "Luohe,CN",
    "Sanmenxia,CN", "Nanyang,CN", "Shangqiu,CN", "Xinyang,CN", "Zhoukou,CN",
    "Zhumadian,CN", "Huangshi,CN", "Shiyan,CN", "Yichang,CN", "Xiangyang,CN",
    "Ezhou,CN", "Jingmen,CN", "Xiaogan,CN", "Jingzhou,CN", "Huanggang,CN",
    "Xianning,CN", "Suizhou,CN", "Zhuzhou,CN", "Xiangtan,CN", "Hengyang,CN",
    
    // 重要地级市 - 华南地区 (25个)
    "Shaoguan,CN", "Zhuhai,CN", "Shantou,CN", "Foshan,CN", "Jiangmen,CN",
    "Zhanjiang,CN", "Maoming,CN", "Zhaoqing,CN", "Huizhou,CN", "Meizhou,CN",
    "Shanwei,CN", "Heyuan,CN", "Yangjiang,CN", "Qingyuan,CN", "Dongguan,CN",
    "Zhongshan,CN", "Chaozhou,CN", "Jieyang,CN", "Yunfu,CN", "Liuzhou,CN",
    "Guilin,CN", "Wuzhou,CN", "Beihai,CN", "Fangchenggang,CN", "Qinzhou,CN",
    
    // 重要地级市 - 西南地区 (30个)
    "Zigong,CN", "Panzhihua,CN", "Luzhou,CN", "Deyang,CN", "Mianyang,CN",
    "Guangyuan,CN", "Suining,CN", "Neijiang,CN", "Leshan,CN", "Nanchong,CN",
    "Meishan,CN", "Yibin,CN", "Guanghan,CN", "Dazhou,CN", "Ya'an,CN",
    "Bazhong,CN", "Ziyang,CN", "Aba,CN", "Ganzi,CN", "Liangshan,CN",
    "Zunyi,CN", "Liupanshui,CN", "Anshun,CN", "Bijie,CN", "Tongren,CN",
    "Qianxinan,CN", "Qiandongnan,CN", "Qiannan,CN", "Qujing,CN", "Yuxi,CN",
    
    // 重要地级市 - 西北地区 (25个)
    "Baoji,CN", "Xianyang,CN", "Weinan,CN", "Yan'an,CN", "Hanzhong,CN",
    "Yulin,CN", "Ankang,CN", "Shangluo,CN", "Tianshui,CN", "Wuwei,CN",
    "Zhangye,CN", "Pingliang,CN", "Jiuquan,CN", "Qingyang,CN", "Dingxi,CN",
    "Longnan,CN", "Linxia,CN", "Gannan,CN", "Haidong,CN", "Haibei,CN",
    "Huangnan,CN", "Hainan,CN", "Golog,CN", "Yushu,CN", "Haixi,CN",
    
    // 新疆重要城市 (15个)
    "Karamay,CN", "Turpan,CN", "Hami,CN", "Changji,CN", "Bortala,CN",
    "Bayingolin,CN", "Aksu,CN", "Kizilsu,CN", "Kashgar,CN", "Hotan,CN",
    "Ili,CN", "Tacheng,CN", "Altay,CN", "Shihezi,CN", "Tumxuk,CN",
    
    // 西藏重要城市 (6个)
    "Shigatse,CN", "Chamdo,CN", "Nyingchi,CN", "Shannan,CN", "Nagqu,CN",
    "Ali,CN",
    
    // 内蒙古重要城市 (12个)
    "Baotou,CN", "Wuhai,CN", "Chifeng,CN", "Tongliao,CN", "Ordos,CN",
    "Hulunbuir,CN", "Bayannur,CN", "Ulanqab,CN", "Hinggan,CN", "Xilingol,CN",
    "Alxa,CN", "Erenhot,CN"
  ];
}

// 获取城市天气数据
async function fetchCityWeather(city: string): Promise<CityWeatherData | null> {
  try {
    console.log(`🌤️ 获取 ${city} 天气数据`);
    
    // 优先使用WeatherAPI
    const weatherApiKey = process.env.WEATHERAPI_KEY;
    if (weatherApiKey) {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=no&lang=zh`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(6000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${city} 成功: ${data.current.temp_c}°C`);
          
          return {
            name: data.location.name,
            province: data.location.region || data.location.country,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph / 3.6,
            rank: 0,
            apiSource: "WeatherAPI"
          };
        }
      } catch (error) {
        console.log(`⚠️ ${city} WeatherAPI失败`);
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
            signal: AbortSignal.timeout(6000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${city} OpenWeather成功: ${data.main.temp}°C`);
          
          return {
            name: data.name,
            province: data.sys.country,
            temperature: data.main.temp,
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            rank: 0,
            apiSource: "OpenWeatherMap"
          };
        }
      } catch (error) {
        console.log(`⚠️ ${city} OpenWeatherMap失败`);
      }
    }

    console.log(`❌ ${city} 所有API都失败`);
    return null;

  } catch (error) {
    console.error(`❌ ${city} 获取失败:`, error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // 检查缓存
    const cacheKey = "china-cities-ranking";
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      const cacheAge = Math.floor((now - cached.timestamp) / (60 * 1000)); // 分钟
      const remainingTime = Math.floor((CACHE_DURATION - (now - cached.timestamp)) / (60 * 1000)); // 分钟
      console.log(`📋 返回缓存的中国城市排行榜数据 (缓存了${cacheAge}分钟，还剩${remainingTime}分钟)`);

      // 更新缓存状态信息
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cachedResult = cached.data as any;
      if (cachedResult.metadata) {
        cachedResult.metadata.cacheStatus = "cached";
        cachedResult.metadata.cacheAge = `${cacheAge}分钟前`;
        cachedResult.metadata.nextUpdate = `${remainingTime}分钟后`;
      }

      return NextResponse.json(cachedResult);
    }

    console.log("🇨🇳 开始获取中国所有城市天气排行榜");
    const startTime = Date.now();

    const allChinaCities = getAllChinaCities();
    console.log(`🌍 准备获取 ${allChinaCities.length} 个中国城市的天气数据`);

    const results: CityWeatherData[] = [];

    // 分批处理，每批5个城市，避免API限制
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < allChinaCities.length; i += batchSize) {
      batches.push(allChinaCities.slice(i, i + batchSize));
    }

    let processedCount = 0;
    for (const batch of batches) {
      const batchPromises = batch.map(city => fetchCityWeather(city));
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result) {
          results.push(result);
        }
      }
      
      processedCount += batch.length;
      console.log(`📊 已处理 ${processedCount}/${allChinaCities.length} 个城市，成功获取 ${results.length} 个`);
      
      // 批次间延迟，避免API限制
      if (processedCount < allChinaCities.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (results.length < 50) {
      console.warn(`⚠️ 只获取到 ${results.length} 个城市数据，数据不足`);
      return NextResponse.json(
        {
          error: "获取的中国城市数据不足，请稍后重试",
          citiesCount: results.length,
          totalCities: allChinaCities.length,
          minRequired: 50
        },
        { status: 503 }
      );
    }

    // 按温度排序并添加排名
    const sortedCities = results
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
        totalAttempted: allChinaCities.length,
        successRate: `${((sortedCities.length / allChinaCities.length) * 100).toFixed(1)}%`,
        updateTime: new Date().toISOString(),
        processingTime: `${totalTime}ms`,
        dataSource: "中国全城市覆盖",
        coverage: "包含所有省会城市、直辖市、重要地级市",
        cacheStatus: "fresh",
        updateFrequency: "每1小时更新一次",
        cacheAge: "刚刚更新",
        nextUpdate: "59分钟后"
      },
      hottest: sortedCities.slice(0, 20),
      coldest: sortedCities.slice(-20).reverse(),
      statistics: {
        averageTemp: (sortedCities.reduce((sum, city) => sum + city.temperature, 0) / sortedCities.length).toFixed(1),
        maxTemp: sortedCities[0]?.temperature || 0,
        minTemp: sortedCities[sortedCities.length - 1]?.temperature || 0,
        tempRange: (sortedCities[0]?.temperature || 0) - (sortedCities[sortedCities.length - 1]?.temperature || 0)
      }
    };

    // 更新缓存
    cache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    console.log(`✅ 中国城市排行榜完成，总耗时: ${totalTime}ms，成功率: ${result.metadata.successRate}`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ 获取中国城市排行榜失败:", error);
    return NextResponse.json(
      { 
        error: "获取中国城市天气排行榜失败，请稍后重试",
        details: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    );
  }
}
