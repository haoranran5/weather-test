import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 温度单位转换
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

// 格式化温度显示
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${Math.round(celsiusToFahrenheit(temp))}°F`;
  }
  return `${Math.round(temp)}°C`;
}

// 根据天气类型返回对应的emoji
export function getWeatherEmoji(weatherMain: string): string {
  switch (weatherMain?.toLowerCase()) {
    case 'clear':
      return '☀️';
    case 'clouds':
      return '☁️';
    case 'rain':
      return '🌧️';
    case 'drizzle':
      return '🌦️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
      return '🌫️';
    case 'haze':
      return '🌫️';
    case 'dust':
    case 'sand':
      return '🌪️';
    default:
      return '🌤️';
  }
}

// AQI等级信息
export function getAQIInfo(aqi: number) {
  if (aqi <= 50) {
    return { level: '优秀', color: 'text-green-600', bg: 'bg-green-100', description: '空气质量令人满意' };
  } else if (aqi <= 100) {
    return { level: '良好', color: 'text-yellow-600', bg: 'bg-yellow-100', description: '空气质量可接受' };
  } else if (aqi <= 150) {
    return { level: '中等', color: 'text-orange-600', bg: 'bg-orange-100', description: '敏感人群需注意' };
  } else if (aqi <= 200) {
    return { level: '不健康', color: 'text-red-600', bg: 'bg-red-100', description: '所有人群需注意' };
  } else if (aqi <= 300) {
    return { level: '非常不健康', color: 'text-purple-600', bg: 'bg-purple-100', description: '健康警告' };
  } else {
    return { level: '危险', color: 'text-red-800', bg: 'bg-red-200', description: '紧急状况' };
  }
}

// 防抖函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 本地存储工具
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 忽略存储错误
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // 忽略删除错误
    }
  }
};

// 数据缓存工具
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class DataCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    const now = Date.now();
    const expiry = now + (ttlMinutes * 60 * 1000);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry
    });

    // 同时保存到localStorage作为持久化备份
    try {
      storage.set(`cache_${key}`, { data, timestamp: now, expiry });
    } catch {
      // 忽略存储错误
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();

    // 先检查内存缓存
    let item = this.cache.get(key);

    // 如果内存中没有，尝试从localStorage恢复
    if (!item) {
      const stored = storage.get(`cache_${key}`);
      if (stored) {
        item = stored as CacheItem<unknown>;
        this.cache.set(key, item);
      }
    }

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (now > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    storage.remove(`cache_${key}`);
  }

  clear(): void {
    this.cache.clear();
    // 清除所有缓存相关的localStorage项
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  isExpired(key: string): boolean {
    const item = this.cache.get(key) || storage.get(`cache_${key}`);
    if (!item) return true;
    return Date.now() > item.expiry;
  }

  getAge(key: string): number | null {
    const item = this.cache.get(key) || storage.get(`cache_${key}`);
    if (!item) return null;
    return Date.now() - item.timestamp;
  }
}

// 全局缓存实例
export const dataCache = new DataCache();
