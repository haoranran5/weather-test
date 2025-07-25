// 热门城市列表
export const POPULAR_CITIES = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "西安", "武汉",
  "New York", "London", "Paris", "Tokyo", "Sydney", "Dubai", "Singapore", "Seoul"
];

// 全球主要城市ID（OpenWeatherMap）
export const GLOBAL_CITIES = [
  1816670, // 北京 Beijing
  1796236, // 上海 Shanghai
  1795565, // 深圳 Shenzhen
  1815286, // 重庆 Chongqing
  1792947, // 广州 Guangzhou
  1808926, // 杭州 Hangzhou
  1795270, // 成都 Chengdu
  1790630, // 武汉 Wuhan
  1796236, // 天津 Tianjin
  1814991, // 西安 Xi'an
  5128581, // 纽约 New York
  5368361, // 洛杉矶 Los Angeles
  4887398, // 芝加哥 Chicago
  5809844, // 西雅图 Seattle
  5391959, // 旧金山 San Francisco
  2643743, // 伦敦 London
  2968815, // 巴黎 Paris
  2950159, // 柏林 Berlin
  3117735, // 马德里 Madrid
  3173435, // 米兰 Milan
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
  2759794, // 阿姆斯特丹 Amsterdam
  264371,  // 雅典 Athens
  1796236, // 台北 Taipei
  1835847, // 釜山 Busan
  1850147, // 横滨 Yokohama
  1880252, // 吉隆坡 Kuala Lumpur
  1609350, // 胡志明市 Ho Chi Minh City
  1701668, // 马尼拉 Manila
  1642911, // 雅加达 Jakarta
];

// 国家代码映射
export const COUNTRY_NAMES: { [key: string]: string } = {
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
  'DE': '德国',
  'TW': '台湾',
  'MY': '马来西亚',
  'VN': '越南',
  'PH': '菲律宾',
  'ID': '印度尼西亚'
};
