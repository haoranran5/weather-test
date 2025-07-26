import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Snowflake, RefreshCw, TrendingUp } from 'lucide-react';
import { formatTemperature } from '@/lib/utils';

interface CityRankingData {
  name: string;
  englishName?: string;
  country: string;
  region?: string;
  value: number;
  lat?: number;
  lon?: number;
  pm2_5?: number;
  pm10?: number;
  temperature?: number;
  condition?: string;
  localtime?: string;
  airQualityLevel?: string;
  airQualityColor?: string;
  airQualityBg?: string;
  airQualityDescription?: string;
  airQualityDetails?: string;
  airQualityScore?: number;
  epaLevel?: string;
  pm25Level?: string;
  feelsLike?: number;
  windSpeed?: number;
  humidity?: number;
}

interface RankingData {
  hottest: CityRankingData[];
  coldest: CityRankingData[];
  mostHumid: CityRankingData[];
  windiest: CityRankingData[];
  performance?: {
    citiesQueried: number;
    cacheStatus: string;
    totalTime?: string;
    averageTimePerCity?: string;
    cacheAge?: string;
  };
  dataSource?: string;
}

interface GlobalRankingsProps {
  onCityClick: (cityName: string) => void;
  temperatureUnit: 'C' | 'F';
}

export default function GlobalRankings({ onCityClick, temperatureUnit }: GlobalRankingsProps) {
  const [rankings, setRankings] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 开始获取全球排行榜数据（快速版本）');
      const startTime = Date.now();

      const res = await fetch('/api/global-rankings-fast');
      const data = await res.json();

      const endTime = Date.now();
      console.log(`✅ 排行榜数据获取完成，前端耗时: ${endTime - startTime}ms`);
      
      if (!res.ok) {
        throw new Error(data.error || '获取排行榜数据失败');
      }
      
      setRankings(data);
      setLastUpdate(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取排行榜数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
    
    // 每30分钟自动刷新数据
    const interval = setInterval(fetchRankings, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderRankingItem = (item: CityRankingData, index: number, type: 'hottest' | 'coldest' | 'mostHumid' | 'windiest') => {
    const getRankIcon = () => {
      if (index < 3) {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[index];
      }
      return `${index + 1}`;
    };

    const formatValue = () => {
      switch (type) {
        case 'hottest':
        case 'coldest':
          return formatTemperature(item.value, temperatureUnit);
        case 'mostHumid':
          return `${item.value}%`;
        case 'windiest':
          return `${item.value} m/s`;
        default:
          return item.value;
      }
    };

    const getValueColor = () => {
      switch (type) {
        case 'hottest':
          return 'text-orange-600';
        case 'coldest':
          return 'text-blue-600';
        case 'mostHumid':
          return 'text-blue-500';
        case 'windiest':
          return 'text-green-600';
        default:
          return 'text-gray-600';
      }
    };

    return (
      <div
        key={`${item.name}-${item.country}`}
        className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border"
        onClick={() => onCityClick(item.englishName || item.name)}
        title={`点击查询 ${item.name} 的详细天气`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
            {getRankIcon()}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {item.country}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`font-bold ${getValueColor()}`}>
            {formatValue()}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !rankings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            全球城市排行榜
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>加载排行榜数据...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            全球城市排行榜
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️ {error}</div>
            <Button onClick={fetchRankings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新加载
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            全球城市排行榜
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                更新于 {lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRankings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hottest" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hottest" className="text-xs">
              <Flame className="h-4 w-4 mr-1" />
              最热
            </TabsTrigger>
            <TabsTrigger value="coldest" className="text-xs">
              <Snowflake className="h-4 w-4 mr-1" />
              最冷
            </TabsTrigger>
            <TabsTrigger value="mostHumid" className="text-xs">
              💧
              湿度
            </TabsTrigger>
            <TabsTrigger value="windiest" className="text-xs">
              💨
              风速
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hottest" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rankings?.hottest?.map((item, index) => 
                renderRankingItem(item, index, 'hottest')
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="coldest" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rankings?.coldest?.map((item, index) =>
                renderRankingItem(item, index, 'coldest')
              )}
            </div>
          </TabsContent>

          <TabsContent value="mostHumid" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rankings?.mostHumid?.map((item, index) =>
                renderRankingItem(item, index, 'mostHumid')
              )}
            </div>
          </TabsContent>

          <TabsContent value="windiest" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rankings?.windiest?.map((item, index) =>
                renderRankingItem(item, index, 'windiest')
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 性能信息 */}
        {rankings?.performance && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap gap-4 text-xs text-white/60">
              <span>数据源: {rankings.dataSource}</span>
              <span>城市数量: {rankings.performance.citiesQueried}</span>
              {rankings.performance.totalTime && (
                <span>加载时间: {rankings.performance.totalTime}</span>
              )}
              {rankings.performance.cacheStatus && (
                <span>缓存状态: {rankings.performance.cacheStatus === 'cached' ? '缓存' : '实时'}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
