import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const apiKey = process.env.AIR_QUALITY_API_KEY;

  // 检查API key
  if (!apiKey) {
    return NextResponse.json({ error: "Air Quality API key 未配置" }, { status: 500 });
  }

  // 检查参数有效性
  if (!lat || !lon) {
    return NextResponse.json({ error: "缺少经纬度参数" }, { status: 400 });
  }

  if (isNaN(Number(lat)) || isNaN(Number(lon))) {
    return NextResponse.json({ error: "经纬度参数无效" }, { status: 400 });
  }

  // 尝试多个可能的API端点
  const possibleEndpoints = [
    // IQAir AirVisual API
    `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`,
    // WAQI API
    `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`,
    // AirNow API
    `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&API_KEY=${apiKey}`,
    // OpenWeatherMap Air Pollution API (fallback)
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}`
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`尝试空气质量API: ${endpoint.split('?')[0]}`);
      
      const res = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherApp/1.0'
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        // 根据不同API的响应格式进行标准化
        let standardizedData;
        
        if (endpoint.includes('airvisual.com')) {
          // IQAir AirVisual API 格式
          standardizedData = {
            aqi: data.data?.current?.pollution?.aqius || null,
            source: 'AirVisual',
            location: data.data?.city || 'Unknown',
            country: data.data?.country || 'Unknown'
          };
        } else if (endpoint.includes('waqi.info')) {
          // WAQI API 格式
          standardizedData = {
            aqi: data.data?.aqi || null,
            source: 'WAQI',
            location: data.data?.city?.name || 'Unknown',
            country: data.data?.city?.country || 'Unknown'
          };
        } else if (endpoint.includes('airnowapi.org')) {
          // AirNow API 格式
          const aqiData = data[0];
          standardizedData = {
            aqi: aqiData?.AQI || null,
            source: 'AirNow',
            location: aqiData?.ReportingArea || 'Unknown',
            country: 'US'
          };
        } else {
          // OpenWeatherMap Air Pollution API 格式
          standardizedData = {
            aqi: data.list?.[0]?.main?.aqi || null,
            source: 'OpenWeatherMap',
            location: 'Unknown',
            country: 'Unknown'
          };
        }

        if (standardizedData.aqi !== null) {
          console.log(`空气质量数据获取成功，来源: ${standardizedData.source}`);
          return NextResponse.json(standardizedData);
        }
      }
    } catch (error) {
      console.warn(`API请求失败: ${error}`);
      continue;
    }
  }

  // 如果所有API都失败，返回错误
  return NextResponse.json({ 
    error: "无法获取空气质量数据",
    hint: "请检查网络连接或稍后重试"
  }, { status: 500 });
}
