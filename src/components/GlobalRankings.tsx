import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Snowflake, Droplets, Factory, RefreshCw, TrendingUp } from 'lucide-react';
import { formatTemperature, getAQIInfo } from '@/lib/utils';
import { getRandomCities } from '@/lib/cities-data';

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
  mostPolluted: CityRankingData[];
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
      const res = await fetch('/api/global-rankings-weatherapi');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '获取排行榜数据失败');
      }
      
      setRankings(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || '获取排行榜数据失败');
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

  const renderRankingItem = (item: CityRankingData, index: number, type: 'hottest' | 'coldest' | 'mostPolluted') => {
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
        case 'mostPolluted':
          return item.airQualityLevel || `AQI ${item.value}`;
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
        case 'mostPolluted':
          return item.airQualityColor || 'text-red-600';
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
              {type === 'mostPolluted' && item.pm2_5 && (
                <span className="ml-2">PM2.5: {item.pm2_5}μg/m³</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {type === 'mostPolluted' && (
            <Badge variant="outline" className={`${item.airQualityBg || 'bg-red-100'} ${item.airQualityColor || 'text-red-700'} border-0`}>
              {item.airQualityLevel || '差'}
            </Badge>
          )}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hottest" className="text-xs">
              <Flame className="h-4 w-4 mr-1" />
              最热
            </TabsTrigger>
            <TabsTrigger value="coldest" className="text-xs">
              <Snowflake className="h-4 w-4 mr-1" />
              最冷
            </TabsTrigger>
            <TabsTrigger value="mostPolluted" className="text-xs">
              <Factory className="h-4 w-4 mr-1" />
              污染
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

          <TabsContent value="mostPolluted" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rankings?.mostPolluted?.map((item, index) =>
                renderRankingItem(item, index, 'mostPolluted')
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
