// 全球主要城市数据
export interface CityData {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
}

export const globalCities: CityData[] = [
  // 中国主要城市
  { id: "beijing", name: "北京", nameEn: "Beijing", country: "中国", countryCode: "CN", lat: 39.9042, lon: 116.4074, timezone: "Asia/Shanghai" },
  { id: "shanghai", name: "上海", nameEn: "Shanghai", country: "中国", countryCode: "CN", lat: 31.2304, lon: 121.4737, timezone: "Asia/Shanghai" },
  { id: "guangzhou", name: "广州", nameEn: "Guangzhou", country: "中国", countryCode: "CN", lat: 23.1291, lon: 113.2644, timezone: "Asia/Shanghai" },
  { id: "shenzhen", name: "深圳", nameEn: "Shenzhen", country: "中国", countryCode: "CN", lat: 22.5431, lon: 114.0579, timezone: "Asia/Shanghai" },
  { id: "chengdu", name: "成都", nameEn: "Chengdu", country: "中国", countryCode: "CN", lat: 30.5728, lon: 104.0668, timezone: "Asia/Shanghai" },
  { id: "hangzhou", name: "杭州", nameEn: "Hangzhou", country: "中国", countryCode: "CN", lat: 30.2741, lon: 120.1551, timezone: "Asia/Shanghai" },
  { id: "wuhan", name: "武汉", nameEn: "Wuhan", country: "中国", countryCode: "CN", lat: 30.5928, lon: 114.3055, timezone: "Asia/Shanghai" },
  { id: "xian", name: "西安", nameEn: "Xi'an", country: "中国", countryCode: "CN", lat: 34.3416, lon: 108.9398, timezone: "Asia/Shanghai" },
  
  // 美国主要城市
  { id: "newyork", name: "纽约", nameEn: "New York", country: "美国", countryCode: "US", lat: 40.7128, lon: -74.0060, timezone: "America/New_York" },
  { id: "losangeles", name: "洛杉矶", nameEn: "Los Angeles", country: "美国", countryCode: "US", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles" },
  { id: "chicago", name: "芝加哥", nameEn: "Chicago", country: "美国", countryCode: "US", lat: 41.8781, lon: -87.6298, timezone: "America/Chicago" },
  { id: "miami", name: "迈阿密", nameEn: "Miami", country: "美国", countryCode: "US", lat: 25.7617, lon: -80.1918, timezone: "America/New_York" },
  { id: "seattle", name: "西雅图", nameEn: "Seattle", country: "美国", countryCode: "US", lat: 47.6062, lon: -122.3321, timezone: "America/Los_Angeles" },
  
  // 欧洲主要城市
  { id: "london", name: "伦敦", nameEn: "London", country: "英国", countryCode: "GB", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
  { id: "paris", name: "巴黎", nameEn: "Paris", country: "法国", countryCode: "FR", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris" },
  { id: "berlin", name: "柏林", nameEn: "Berlin", country: "德国", countryCode: "DE", lat: 52.5200, lon: 13.4050, timezone: "Europe/Berlin" },
  { id: "rome", name: "罗马", nameEn: "Rome", country: "意大利", countryCode: "IT", lat: 41.9028, lon: 12.4964, timezone: "Europe/Rome" },
  { id: "madrid", name: "马德里", nameEn: "Madrid", country: "西班牙", countryCode: "ES", lat: 40.4168, lon: -3.7038, timezone: "Europe/Madrid" },
  { id: "amsterdam", name: "阿姆斯特丹", nameEn: "Amsterdam", country: "荷兰", countryCode: "NL", lat: 52.3676, lon: 4.9041, timezone: "Europe/Amsterdam" },
  
  // 亚洲其他主要城市
  { id: "tokyo", name: "东京", nameEn: "Tokyo", country: "日本", countryCode: "JP", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
  { id: "seoul", name: "首尔", nameEn: "Seoul", country: "韩国", countryCode: "KR", lat: 37.5665, lon: 126.9780, timezone: "Asia/Seoul" },
  { id: "singapore", name: "新加坡", nameEn: "Singapore", country: "新加坡", countryCode: "SG", lat: 1.3521, lon: 103.8198, timezone: "Asia/Singapore" },
  { id: "bangkok", name: "曼谷", nameEn: "Bangkok", country: "泰国", countryCode: "TH", lat: 13.7563, lon: 100.5018, timezone: "Asia/Bangkok" },
  { id: "mumbai", name: "孟买", nameEn: "Mumbai", country: "印度", countryCode: "IN", lat: 19.0760, lon: 72.8777, timezone: "Asia/Kolkata" },
  { id: "delhi", name: "新德里", nameEn: "New Delhi", country: "印度", countryCode: "IN", lat: 28.6139, lon: 77.2090, timezone: "Asia/Kolkata" },
  
  // 澳洲主要城市
  { id: "sydney", name: "悉尼", nameEn: "Sydney", country: "澳大利亚", countryCode: "AU", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
  { id: "melbourne", name: "墨尔本", nameEn: "Melbourne", country: "澳大利亚", countryCode: "AU", lat: -37.8136, lon: 144.9631, timezone: "Australia/Melbourne" },
  
  // 南美主要城市
  { id: "saopaulo", name: "圣保罗", nameEn: "São Paulo", country: "巴西", countryCode: "BR", lat: -23.5505, lon: -46.6333, timezone: "America/Sao_Paulo" },
  { id: "buenosaires", name: "布宜诺斯艾利斯", nameEn: "Buenos Aires", country: "阿根廷", countryCode: "AR", lat: -34.6118, lon: -58.3960, timezone: "America/Argentina/Buenos_Aires" },
  
  // 非洲主要城市
  { id: "cairo", name: "开罗", nameEn: "Cairo", country: "埃及", countryCode: "EG", lat: 30.0444, lon: 31.2357, timezone: "Africa/Cairo" },
  { id: "capetown", name: "开普敦", nameEn: "Cape Town", country: "南非", countryCode: "ZA", lat: -33.9249, lon: 18.4241, timezone: "Africa/Johannesburg" },
  
  // 中东主要城市
  { id: "dubai", name: "迪拜", nameEn: "Dubai", country: "阿联酋", countryCode: "AE", lat: 25.2048, lon: 55.2708, timezone: "Asia/Dubai" },
  { id: "istanbul", name: "伊斯坦布尔", nameEn: "Istanbul", country: "土耳其", countryCode: "TR", lat: 41.0082, lon: 28.9784, timezone: "Europe/Istanbul" },
];

// 搜索城市函数
export function searchCities(query: string): CityData[] {
  if (!query || query.length < 1) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return globalCities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.nameEn.toLowerCase().includes(lowerQuery) ||
    city.country.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // 限制返回10个结果
}

// 根据ID获取城市
export function getCityById(id: string): CityData | undefined {
  return globalCities.find(city => city.id === id);
}

// 获取随机城市（用于排行榜等功能）
export function getRandomCities(count: number = 50): CityData[] {
  const shuffled = [...globalCities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
