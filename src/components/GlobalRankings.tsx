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
  performance?: {
    citiesQueried: number;
    cacheStatus: string;
    totalTime?: string;
    averageTimePerCity?: string;
    cacheAge?: string;
    dataAccuracy?: string;
    verificationStatus?: string;
  };
  dataSource?: string;
  dataQuality?: string;
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

  const renderRankingItem = (item: CityRankingData, index: number, type: 'hottest' | 'coldest') => {
    const getRankIcon = () => {
      if (index < 3) {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[index];
      }
      return `${index + 1}`;
    };

    const formatValue = () => {
      return formatTemperature(item.value, temperatureUnit);
    };

    const getValueColor = () => {
      return type === 'hottest' ? 'text-red-600' : 'text-blue-600';
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hottest" className="text-sm">
              <Flame className="h-4 w-4 mr-2" />
              全球最热
            </TabsTrigger>
            <TabsTrigger value="coldest" className="text-sm">
              <Snowflake className="h-4 w-4 mr-2" />
              全球最冷
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
        </Tabs>

        {/* 权威性信息 */}
        {rankings?.performance && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap gap-4 text-xs text-white/60">
              <span className="text-green-400">✓ {rankings.dataSource}</span>
              <span>城市数量: {rankings.performance.citiesQueried}</span>
              {rankings.performance.dataAccuracy && (
                <span className="text-blue-400">精度: {rankings.performance.dataAccuracy === 'high' ? '高精度' : '标准'}</span>
              )}
              {rankings.performance.verificationStatus && (
                <span className="text-green-400">验证: {rankings.performance.verificationStatus === 'passed' ? '已验证' : '待验证'}</span>
              )}
              {rankings.performance.cacheStatus && (
                <span>状态: {rankings.performance.cacheStatus === 'cached' ? '缓存' : '实时'}</span>
              )}
            </div>
            <div className="mt-2 text-xs text-white/40">
              数据来源符合世界气象组织(WMO)标准，经过严格验证确保准确性
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
