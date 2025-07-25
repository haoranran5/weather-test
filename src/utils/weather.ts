import { AQIInfo } from '@/types/weather';

// 格式化时间
export function formatTime(ts: number, tz: number): string {
  const date = new Date((ts + tz) * 1000);
  return date.toTimeString().slice(0, 5);
}

// 获取天气图标
export function getWeatherIcon(main: string, code: string): string {
  const codeNum = parseInt(code);
  if (codeNum >= 200 && codeNum < 300) return "⛈️"; // 雷暴
  if (codeNum >= 300 && codeNum < 400) return "🌦️"; // 毛毛雨
  if (codeNum >= 500 && codeNum < 600) return "🌧️"; // 雨
  if (codeNum >= 600 && codeNum < 700) return "🌨️"; // 雪
  if (codeNum >= 700 && codeNum < 800) return "🌫️"; // 雾霾
  if (codeNum === 800) return "☀️"; // 晴天
  if (codeNum === 801) return "🌤️"; // 少云
  if (codeNum >= 802 && codeNum <= 804) return "☁️"; // 多云
  return "❓";
}

// 获取AQI等级描述和颜色
export function getAQIInfo(aqi: number): AQIInfo {
  switch (aqi) {
    case 1: return { text: "优", color: "text-green-600", bg: "bg-green-100" };
    case 2: return { text: "良", color: "text-yellow-600", bg: "bg-yellow-100" };
    case 3: return { text: "轻度污染", color: "text-orange-600", bg: "bg-orange-100" };
    case 4: return { text: "中度污染", color: "text-red-600", bg: "bg-red-100" };
    case 5: return { text: "重度污染", color: "text-purple-600", bg: "bg-purple-100" };
    default: return { text: "未知", color: "text-gray-600", bg: "bg-gray-100" };
  }
}

// 获取风向描述
export function getWindDirection(deg: number): string {
  if (deg >= 337.5 || deg < 22.5) return "北风";
  if (deg >= 22.5 && deg < 67.5) return "东北风";
  if (deg >= 67.5 && deg < 112.5) return "东风";
  if (deg >= 112.5 && deg < 157.5) return "东南风";
  if (deg >= 157.5 && deg < 202.5) return "南风";
  if (deg >= 202.5 && deg < 247.5) return "西南风";
  if (deg >= 247.5 && deg < 292.5) return "西风";
  if (deg >= 292.5 && deg < 337.5) return "西北风";
  return "无风";
}

// 获取风力等级
export function getWindLevel(speed: number): string {
  if (speed < 0.3) return "无风";
  if (speed < 1.6) return "软风";
  if (speed < 3.4) return "轻风";
  if (speed < 5.5) return "微风";
  if (speed < 8.0) return "和风";
  if (speed < 10.8) return "清风";
  if (speed < 13.9) return "强风";
  if (speed < 17.2) return "疾风";
  if (speed < 20.8) return "大风";
  if (speed < 24.5) return "烈风";
  if (speed < 28.5) return "狂风";
  if (speed < 32.7) return "暴风";
  return "飓风";
}

// 温度颜色映射
export function getTemperatureColor(temp: number): string {
  if (temp >= 35) return "text-red-600";
  if (temp >= 25) return "text-orange-500";
  if (temp >= 15) return "text-yellow-500";
  if (temp >= 5) return "text-green-500";
  if (temp >= -5) return "text-blue-500";
  return "text-blue-700";
}

// 湿度颜色映射
export function getHumidityColor(humidity: number): string {
  if (humidity >= 80) return "text-blue-600";
  if (humidity >= 60) return "text-blue-500";
  if (humidity >= 40) return "text-green-500";
  if (humidity >= 20) return "text-yellow-500";
  return "text-red-500";
}
