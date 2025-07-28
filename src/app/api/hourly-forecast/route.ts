import { NextRequest, NextResponse } from "next/server";

// 简化的小时预报API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Beijing";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  console.log(`🌤️ 小时预报API请求: city=${city}, lat=${lat}, lon=${lon}`);

  try {
    let hourlyData = [];
    let dataSource = "未知";
    let apiUsed = "none";

    // 优先使用WeatherAPI.com
    const weatherApiKey = process.env.WEATHERAPI_KEY;
    if (weatherApiKey) {
      try {
        console.log(`🔑 尝试WeatherAPI.com`);
        
        let query = city;
        if (lat && lon) {
          query = `${lat},${lon}`;
        }

        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(query)}&hours=24&aqi=no&alerts=no&lang=zh`,
          { 
            headers: { 'User-Agent': 'WeatherApp/1.0' },
            signal: AbortSignal.timeout(8000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ WeatherAPI.com响应成功`);
          
          if (data.forecast?.forecastday?.[0]?.hour) {
            const hours = data.forecast.forecastday[0].hour;
            const currentHour = new Date().getHours();

            // 获取从当前小时开始的24小时数据
            for (let i = 0; i < 24; i++) {
              const hourIndex = (currentHour + i) % 24;
              const hour = hours[hourIndex];
              
              if (hour) {
                hourlyData.push({
                  time: new Date(hour.time).getTime(),
                  temperature: hour.temp_c,
                  condition: hour.condition.text,
                  precipitationProbability: hour.chance_of_rain || hour.chance_of_snow || 0,
                  windSpeed: hour.wind_kph / 3.6, // 转换为m/s
                  humidity: hour.humidity,
                  icon: hour.condition.text // 使用天气状况文本而不是图标URL
                });
              }
            }
            
            dataSource = "WeatherAPI.com";
            apiUsed = "weatherapi";
            console.log(`✅ WeatherAPI.com成功获取 ${hourlyData.length} 小时数据`);
          }
        } else {
          console.log(`❌ WeatherAPI.com HTTP错误: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ WeatherAPI.com异常:`, error);
      }
    } else {
      console.log(`⚠️ WeatherAPI.com密钥未配置`);
    }

    // 如果WeatherAPI失败，尝试OpenWeatherMap
    if (hourlyData.length === 0) {
      const openWeatherKey = process.env.OPENWEATHERMAP_API_KEY;
      if (openWeatherKey) {
        try {
          console.log(`🔑 尝试OpenWeatherMap`);
          
          let query = city;
          if (lat && lon) {
            query = `lat=${lat}&lon=${lon}`;
          } else {
            query = `q=${encodeURIComponent(city)}`;
          }

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${openWeatherKey}&units=metric&lang=zh_cn`,
            { 
              headers: { 'User-Agent': 'WeatherApp/1.0' },
              signal: AbortSignal.timeout(8000)
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ OpenWeatherMap响应成功`);
            
            if (data.list && Array.isArray(data.list)) {
              // OpenWeatherMap返回5天预报，每3小时一个数据点
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              hourlyData = data.list.slice(0, 8).map((item: any) => ({
                time: item.dt * 1000,
                temperature: item.main.temp,
                condition: item.weather[0].description,
                precipitationProbability: (item.pop || 0) * 100,
                windSpeed: item.wind.speed,
                humidity: item.main.humidity,
                icon: item.weather[0].description // 使用天气状况文本而不是图标URL
              }));
              
              dataSource = "OpenWeatherMap";
              apiUsed = "openweathermap";
              console.log(`✅ OpenWeatherMap成功获取 ${hourlyData.length} 个时段数据`);
            }
          } else {
            console.log(`❌ OpenWeatherMap HTTP错误: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ OpenWeatherMap异常:`, error);
        }
      } else {
        console.log(`⚠️ OpenWeatherMap密钥未配置`);
      }
    }

    // 如果所有API都失败，生成智能模拟数据
    if (hourlyData.length === 0) {
      console.log(`🧠 生成智能模拟数据`);
      
      const now = Date.now();
      const baseTemp = 20; // 基础温度
      
      for (let i = 0; i < 24; i++) {
        const time = now + i * 3600000;
        const hour = new Date(time).getHours();
        
        // 基于时间的温度变化模式（白天热，夜晚凉）
        const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
        const randomVariation = (Math.random() - 0.5) * 3;
        
        // 基于时间的天气条件
        let condition = "晴朗";
        if (hour >= 6 && hour <= 18) {
          condition = ["晴朗", "多云", "局部多云"][Math.floor(Math.random() * 3)];
        } else {
          condition = ["晴朗", "多云", "阴天"][Math.floor(Math.random() * 3)];
        }
        
        hourlyData.push({
          time: time,
          temperature: Math.round((baseTemp + tempVariation + randomVariation) * 10) / 10,
          condition: condition,
          precipitationProbability: Math.floor(Math.random() * 30), // 0-30%降水概率
          windSpeed: Math.round((2 + Math.random() * 6) * 10) / 10, // 2-8 m/s
          humidity: Math.floor(50 + Math.random() * 30), // 50-80%湿度
          icon: "🌤️"
        });
      }
      
      dataSource = "智能模拟";
      apiUsed = "simulation";
      console.log(`✅ 生成智能模拟数据 ${hourlyData.length} 小时`);
    }

    const result = {
      success: true,
      hourly: hourlyData,
      location: city,
      dataSource: dataSource,
      apiUsed: apiUsed,
      totalHours: hourlyData.length,
      lastUpdated: new Date().toISOString(),
      apiStatus: {
        weatherApiKey: !!process.env.WEATHERAPI_KEY,
        openWeatherKey: !!process.env.OPENWEATHERMAP_API_KEY
      }
    };

    console.log(`✅ 小时预报API完成: ${dataSource}, ${hourlyData.length}小时数据`);
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ 小时预报API失败:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      location: city,
      hourly: [],
      dataSource: "错误",
      apiUsed: "none",
      totalHours: 0,
      apiStatus: {
        weatherApiKey: !!process.env.WEATHERAPI_KEY,
        openWeatherKey: !!process.env.OPENWEATHERMAP_API_KEY
      }
    }, { status: 500 });
  }
}
