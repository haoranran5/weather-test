import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  // 检查API key
  if (!apiKey) {
    return NextResponse.json({ error: "API key 配置错误" }, { status: 500 });
  }

  // 检查参数有效性
  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: "缺少查询参数（城市或经纬度）" }, { status: 400 });
  }
  if ((lat && isNaN(Number(lat))) || (lon && isNaN(Number(lon)))) {
    return NextResponse.json({ error: "经纬度参数无效" }, { status: 400 });
  }

  let url = "";
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city!)}&appid=${apiKey}&units=metric&lang=zh_cn`;
  }

  try {
    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "API key 无效或无权限" }, { status: 401 });
    }
    if (res.status === 429) {
      return NextResponse.json({ error: "API 调用频率超限，请稍后再试" }, { status: 429 });
    }
    if (res.status === 404) {
      return NextResponse.json({ error: "未找到该地区的天气信息" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `天气服务异常（${res.status}）` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "获取天气信息失败，请检查网络或稍后重试" }, { status: 500 });
  }
} 