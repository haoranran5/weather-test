// API管理器 - 智能切换和优先级管理
interface APIConfig {
  name: string;
  priority: number; // 数字越小优先级越高
  avgResponseTime: number; // 平均响应时间(ms)
  successRate: number; // 成功率 0-1
  lastFailTime?: number; // 上次失败时间
  isAvailable: boolean; // 是否可用
  dailyLimit: number; // 每日限制
  dailyUsed: number; // 今日已用
  resetTime: number; // 重置时间戳
}

interface WeatherAPIResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  responseTime: number;
  apiUsed: string;
}

class APIManager {
  private apis: Map<string, APIConfig> = new Map();
  private readonly FAILURE_COOLDOWN = 5 * 60 * 1000; // 5分钟冷却期
  private readonly MAX_RETRIES = 3; // 最大重试次数

  constructor() {
    this.initializeAPIs();
  }

  private initializeAPIs() {
    // 按响应速度和可靠性排序
    const apiConfigs: APIConfig[] = [
      {
        name: 'WeatherAPI',
        priority: 1,
        avgResponseTime: 800,
        successRate: 0.95,
        isAvailable: true,
        dailyLimit: 10000,
        dailyUsed: 0,
        resetTime: this.getNextResetTime()
      },
      {
        name: 'OpenWeatherMap',
        priority: 2,
        avgResponseTime: 1200,
        successRate: 0.90,
        isAvailable: true,
        dailyLimit: 1000,
        dailyUsed: 0,
        resetTime: this.getNextResetTime()
      },
      {
        name: 'VisualCrossing',
        priority: 3,
        avgResponseTime: 1500,
        successRate: 0.85,
        isAvailable: true,
        dailyLimit: 1000,
        dailyUsed: 0,
        resetTime: this.getNextResetTime()
      },
      {
        name: 'Tomorrow',
        priority: 4,
        avgResponseTime: 2000,
        successRate: 0.80,
        isAvailable: true,
        dailyLimit: 500,
        dailyUsed: 0,
        resetTime: this.getNextResetTime()
      }
    ];

    apiConfigs.forEach(config => {
      this.apis.set(config.name, config);
    });
  }

  private getNextResetTime(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  // 获取可用的API列表，按优先级排序
  private getAvailableAPIs(): APIConfig[] {
    const now = Date.now();
    
    return Array.from(this.apis.values())
      .filter(api => {
        // 检查是否在冷却期
        if (api.lastFailTime && (now - api.lastFailTime) < this.FAILURE_COOLDOWN) {
          return false;
        }
        
        // 检查每日限制
        if (api.dailyUsed >= api.dailyLimit) {
          return false;
        }
        
        // 检查重置时间
        if (now > api.resetTime) {
          api.dailyUsed = 0;
          api.resetTime = this.getNextResetTime();
        }
        
        return api.isAvailable;
      })
      .sort((a, b) => {
        // 综合排序：优先级 + 响应时间 + 成功率
        const scoreA = a.priority + (a.avgResponseTime / 1000) + (1 - a.successRate) * 10;
        const scoreB = b.priority + (b.avgResponseTime / 1000) + (1 - b.successRate) * 10;
        return scoreA - scoreB;
      });
  }

  // 记录API调用结果
  private recordAPIResult(apiName: string, success: boolean, responseTime: number) {
    const api = this.apis.get(apiName);
    if (!api) return;

    api.dailyUsed++;
    
    if (success) {
      // 更新平均响应时间（指数移动平均）
      api.avgResponseTime = api.avgResponseTime * 0.8 + responseTime * 0.2;
      // 更新成功率
      api.successRate = Math.min(0.99, api.successRate * 0.95 + 0.05);
      // 清除失败时间
      delete api.lastFailTime;
    } else {
      // 记录失败时间
      api.lastFailTime = Date.now();
      // 降低成功率
      api.successRate = Math.max(0.1, api.successRate * 0.9);
      // 增加响应时间惩罚
      api.avgResponseTime = api.avgResponseTime * 1.1;
    }
  }

  // 智能获取天气数据
  async fetchWeatherData(city: string): Promise<WeatherAPIResult> {
    const availableAPIs = this.getAvailableAPIs();
    
    if (availableAPIs.length === 0) {
      return {
        success: false,
        error: '所有天气API暂时不可用，请稍后重试',
        responseTime: 0,
        apiUsed: 'none'
      };
    }

    let lastError = '';
    
    // 依次尝试可用的API
    for (const api of availableAPIs) {
      try {
        console.log(`🌤️ 尝试使用 ${api.name} API (优先级: ${api.priority}, 成功率: ${(api.successRate * 100).toFixed(1)}%)`);
        
        const startTime = Date.now();
        const result = await this.callAPI(api.name, city);
        const responseTime = Date.now() - startTime;
        
        if (result.success) {
          this.recordAPIResult(api.name, true, responseTime);
          console.log(`✅ ${api.name} API 调用成功 (${responseTime}ms)`);
          
          return {
            success: true,
            data: result.data,
            responseTime,
            apiUsed: api.name
          };
        } else {
          this.recordAPIResult(api.name, false, responseTime);
          lastError = result.error || `${api.name} API 调用失败`;
          console.log(`❌ ${api.name} API 失败: ${lastError}`);
        }
        
      } catch (error) {
        this.recordAPIResult(api.name, false, 5000);
        lastError = error instanceof Error ? error.message : '未知错误';
        console.log(`💥 ${api.name} API 异常: ${lastError}`);
      }
    }

    return {
      success: false,
      error: lastError || '所有API都调用失败',
      responseTime: 0,
      apiUsed: 'failed'
    };
  }

  // 调用具体的API
  private async callAPI(apiName: string, city: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    switch (apiName) {
      case 'WeatherAPI':
        return this.callWeatherAPI(city);
      case 'OpenWeatherMap':
        return this.callOpenWeatherMap(city);
      case 'VisualCrossing':
        return this.callVisualCrossing(city);
      case 'Tomorrow':
        return this.callTomorrowAPI(city);
      default:
        return { success: false, error: '未知的API' };
    }
  }

  // WeatherAPI.com 调用
  private async callWeatherAPI(city: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const apiKey = process.env.WEATHERAPI_KEY;
    if (!apiKey) {
      return { success: false, error: 'WeatherAPI密钥未配置' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes&lang=zh`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `WeatherAPI HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: this.normalizeWeatherAPIData(data) };
  }

  // OpenWeatherMap 调用
  private async callOpenWeatherMap(city: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'OpenWeatherMap密钥未配置' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=zh_cn`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `OpenWeatherMap HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: this.normalizeOpenWeatherData(data) };
  }

  // Visual Crossing 调用
  private async callVisualCrossing(city: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const apiKey = process.env.VISUAL_CROSSING_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Visual Crossing密钥未配置' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}/today?key=${apiKey}&include=current&lang=zh`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `Visual Crossing HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: this.normalizeVisualCrossingData(data) };
  }

  // Tomorrow.io 调用
  private async callTomorrowAPI(city: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const apiKey = process.env.TOMORROW_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Tomorrow.io密钥未配置' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${encodeURIComponent(city)}&apikey=${apiKey}&units=metric`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `Tomorrow.io HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: this.normalizeTomorrowData(data) };
  }

  // 数据标准化方法
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeWeatherAPIData(data: Record<string, any>): Record<string, unknown> {
    return {
      coord: { lat: data.location.lat, lon: data.location.lon },
      weather: [{
        main: data.current.condition.text,
        description: data.current.condition.text,
        icon: data.current.condition.icon
      }],
      main: {
        temp: data.current.temp_c,
        feels_like: data.current.feelslike_c,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        temp_min: data.current.temp_c - 2,
        temp_max: data.current.temp_c + 2
      },
      wind: {
        speed: data.current.wind_kph / 3.6,
        deg: data.current.wind_degree
      },
      visibility: data.current.vis_km * 1000,
      name: data.location.name,
      sys: { country: data.location.country },
      source: 'WeatherAPI.com'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeOpenWeatherData(data: Record<string, any>): Record<string, unknown> {
    return {
      ...data,
      source: 'OpenWeatherMap'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeVisualCrossingData(data: Record<string, any>): Record<string, unknown> {
    const current = data.currentConditions;
    return {
      coord: { lat: data.latitude, lon: data.longitude },
      weather: [{
        main: current.conditions,
        description: current.conditions,
        icon: '01d'
      }],
      main: {
        temp: current.temp,
        feels_like: current.feelslike,
        humidity: current.humidity,
        pressure: current.pressure,
        temp_min: current.temp - 2,
        temp_max: current.temp + 2
      },
      wind: {
        speed: current.windspeed / 3.6,
        deg: current.winddir
      },
      visibility: current.visibility * 1000,
      name: data.resolvedAddress,
      sys: { country: 'Unknown' },
      source: 'Visual Crossing'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private normalizeTomorrowData(data: Record<string, any>): Record<string, unknown> {
    const current = data.data.values;
    return {
      coord: { lat: data.location.lat, lon: data.location.lon },
      weather: [{
        main: '晴朗',
        description: '晴朗',
        icon: '01d'
      }],
      main: {
        temp: current.temperature,
        feels_like: current.temperatureApparent,
        humidity: current.humidity,
        pressure: current.pressureSeaLevel,
        temp_min: current.temperature - 2,
        temp_max: current.temperature + 2
      },
      wind: {
        speed: current.windSpeed,
        deg: current.windDirection
      },
      visibility: current.visibility * 1000,
      name: 'Unknown',
      sys: { country: 'Unknown' },
      source: 'Tomorrow.io'
    };
  }

  // 获取API状态
  getAPIStatus(): { name: string; status: string; successRate: number; avgResponseTime: number; dailyUsed: number; dailyLimit: number }[] {
    return Array.from(this.apis.values()).map(api => ({
      name: api.name,
      status: api.isAvailable ? '可用' : '不可用',
      successRate: Math.round(api.successRate * 100),
      avgResponseTime: Math.round(api.avgResponseTime),
      dailyUsed: api.dailyUsed,
      dailyLimit: api.dailyLimit
    }));
  }
}

// 导出单例
export const apiManager = new APIManager();
export type { WeatherAPIResult };
