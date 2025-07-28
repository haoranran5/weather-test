import { NextRequest, NextResponse } from "next/server";

// 简化的24小时预报测试API - 专为Vercel优化
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Beijing";

  try {
    console.log(`🧪 测试API: 获取 ${city} 的24小时预报`);
    
    // 检查环境变量
    const weatherApiKey = process.env.WEATHERAPI_KEY;
    const openWeatherKey = process.env.OPENWEATHERMAP_API_KEY;
    
    console.log(`🔑 环境变量检查: WeatherAPI=${!!weatherApiKey}, OpenWeather=${!!openWeatherKey}`);
    
    if (!weatherApiKey && !openWeatherKey) {
      return NextResponse.json({
        error: "没有可用的API密钥",
        weatherApiKey: !!weatherApiKey,
        openWeatherKey: !!openWeatherKey
      }, { status: 500 });
    }

    let hourlyData = [];
    let dataSource = "未知";
    let apiError = null;

    // 尝试WeatherAPI
    if (weatherApiKey) {
      try {
        console.log(`🌤️ 尝试WeatherAPI: ${city}`);
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&hours=24&aqi=no&alerts=no&lang=zh`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ WeatherAPI响应成功`);
          
          if (data.forecast?.forecastday?.[0]?.hour) {
            const hours = data.forecast.forecastday[0].hour;
            const currentHour = new Date().getHours();

            for (let i = 0; i < 24; i++) {
              const hourIndex = (currentHour + i) % 24;
              const hour = hours[hourIndex];
              
              if (hour) {
                hourlyData.push({
                  time: new Date(hour.time).getTime(),
                  temperature: hour.temp_c,
                  condition: hour.condition.text,
                  precipitationProbability: hour.chance_of_rain || 0,
                  windSpeed: hour.wind_kph / 3.6,
                  humidity: hour.humidity,
                  icon: hour.condition.icon
                });
              }
            }
            dataSource = "WeatherAPI.com";
            console.log(`✅ WeatherAPI成功获取 ${hourlyData.length} 小时数据`);
          }
        } else {
          apiError = `WeatherAPI HTTP ${response.status}`;
          console.log(`❌ WeatherAPI失败: ${apiError}`);
        }
      } catch (error) {
        apiError = `WeatherAPI错误: ${error instanceof Error ? error.message : 'Unknown'}`;
        console.log(`❌ WeatherAPI异常: ${apiError}`);
      }
    }

    // 如果WeatherAPI失败，尝试OpenWeatherMap
    if (hourlyData.length === 0 && openWeatherKey) {
      try {
        console.log(`🌤️ 尝试OpenWeatherMap: ${city}`);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${openWeatherKey}&units=metric&lang=zh_cn`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(10000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ OpenWeatherMap响应成功`);
          
          if (data.list && Array.isArray(data.list)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hourlyData = data.list.slice(0, 8).map((item: any) => ({
              time: item.dt * 1000,
              temperature: item.main.temp,
              condition: item.weather[0].description,
              precipitationProbability: (item.pop || 0) * 100,
              windSpeed: item.wind.speed,
              humidity: item.main.humidity,
              icon: `https://openweathermap.org/img/w/${item.weather[0].icon}.png`
            }));
            dataSource = "OpenWeatherMap";
            console.log(`✅ OpenWeatherMap成功获取 ${hourlyData.length} 小时数据`);
          }
        } else {
          const owmError = `OpenWeatherMap HTTP ${response.status}`;
          apiError = apiError ? `${apiError}; ${owmError}` : owmError;
          console.log(`❌ OpenWeatherMap失败: ${owmError}`);
        }
      } catch (error) {
        const owmError = `OpenWeatherMap错误: ${error instanceof Error ? error.message : 'Unknown'}`;
        apiError = apiError ? `${apiError}; ${owmError}` : owmError;
        console.log(`❌ OpenWeatherMap异常: ${owmError}`);
      }
    }

    // 如果所有API都失败，生成模拟数据
    if (hourlyData.length === 0) {
      console.log(`🧠 生成模拟24小时数据`);
      const now = Date.now();
      for (let i = 0; i < 24; i++) {
        const hourOfDay = (new Date(now + i * 3600000).getHours());
        const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 6;
        const baseTemp = 20;
        
        hourlyData.push({
          time: now + i * 3600000,
          temperature: Math.round((baseTemp + tempVariation + (Math.random() - 0.5) * 2) * 10) / 10,
          condition: ["晴朗", "多云", "阴天"][Math.floor(Math.random() * 3)],
          precipitationProbability: Math.floor(Math.random() * 30),
          windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
          humidity: Math.floor(50 + Math.random() * 30),
          icon: "🌤️"
        });
      }
      dataSource = "模拟数据";
      console.log(`✅ 生成模拟数据 ${hourlyData.length} 小时`);
    }

    const result = {
      success: true,
      hourly: hourlyData,
      location: city,
      dataSource: dataSource,
      lastUpdated: new Date().toISOString(),
      totalHours: hourlyData.length,
      apiStatus: {
        weatherApiKey: !!weatherApiKey,
        openWeatherKey: !!openWeatherKey,
        apiError: apiError
      }
    };

    console.log(`✅ 测试API完成: ${dataSource}, ${hourlyData.length}小时数据`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ 测试API失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      location: city,
      apiStatus: {
        weatherApiKey: !!process.env.WEATHERAPI_KEY,
        openWeatherKey: !!process.env.OPENWEATHERMAP_API_KEY
      }
    }, { status: 500 });
  }
}
