import { NextRequest, NextResponse } from "next/server";
import { apiManager } from "@/lib/api-manager";

// 缓存配置
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存
const cache: Map<string, { data: unknown; timestamp: number }> = new Map();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!city && (!lat || !lon)) {
    return NextResponse.json(
      { error: "请提供城市名称或经纬度坐标" },
      { status: 400 }
    );
  }
  try {
    let query: string;
    let cacheKey: string;

    if (city) {
      query = city;
      cacheKey = `city-${city}`;
    } else {
      query = `${lat},${lon}`;
      cacheKey = `coords-${lat}-${lon}`;
    }

    // 检查缓存
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // 使用智能API管理器获取天气数据
    console.log(`🌤️ 开始获取天气数据: ${query}`);
    const result = await apiManager.fetchWeatherData(query);

    if (!result.success) {
      console.log(`❌ 所有API调用失败: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "获取天气数据失败，请稍后重试" },
        { status: 500 }
      );
    }

    console.log(`✅ 成功获取天气数据，使用API: ${result.apiUsed}, 响应时间: ${result.responseTime}ms`);

    // API管理器已经返回标准化的数据
    const transformedData = {
      ...result.data,
      // 添加API使用信息
      apiInfo: {
        provider: result.apiUsed,
        responseTime: result.responseTime,
        timestamp: now
      }
    };

    // 更新缓存
    cache.set(cacheKey, {
      data: transformedData,
      timestamp: now
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Weather API Manager error:", error);
    return NextResponse.json(
      { error: "获取天气数据失败，请稍后重试" },
      { status: 500 }
    );
  }
}