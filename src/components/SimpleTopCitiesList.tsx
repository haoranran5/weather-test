import React from 'react';
import { TopCitiesData, RankingType, WeatherInfo } from '@/types/weather';
import { getAQIInfo } from '@/utils/weather';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flame, Snowflake, Droplets, Factory, TrendingUp } from 'lucide-react';

interface SimpleTopCitiesListProps {
  data: TopCitiesData | null;
  loading: boolean;
  error: string;
  activeTab: RankingType;
  onTabChange: (tab: RankingType) => void;
  onCityClick: (cityName: string) => void;
}

export default function SimpleTopCitiesList({ 
  data, 
  loading, 
  error, 
  activeTab, 
  onTabChange, 
  onCityClick 
}: SimpleTopCitiesListProps) {
  const renderRankingContent = (type: RankingType) => {
    if (!data) return null;
    
    const currentData = data[type];
    if (!currentData || currentData.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          暂无数据
        </div>
      );
    }

    return currentData.map((city: WeatherInfo, index: number) => {
      const getRankingIcon = () => {
        switch (type) {
          case 'hottest': return <Flame className="h-4 w-4 text-orange-500" />;
          case 'coldest': return <Snowflake className="h-4 w-4 text-blue-500" />;
          case 'mostHumid': return <Droplets className="h-4 w-4 text-green-500" />;
          case 'mostPolluted': return <Factory className="h-4 w-4 text-red-500" />;
          default: return <TrendingUp className="h-4 w-4" />;
        }
      };
      
      return (
        <div 
          key={`${city.name}-${city.country}`} 
          className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border"
          onClick={() => onCityClick(city.name)}
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
              {index + 1}
            </Badge>
            <div className="flex items-center gap-2">
              {getRankingIcon()}
              <div>
                <div className="font-medium">{city.name}</div>
                <div className="text-xs text-muted-foreground">{city.countryName}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {type === 'mostPolluted' ? (
              <>
                {(() => {
                  const aqiInfo = getAQIInfo(city.value);
                  return (
                    <Badge variant="outline" className={`${aqiInfo.bg} ${aqiInfo.color} border-0`}>
                      {aqiInfo.text}
                    </Badge>
                  );
                })()}
                <span className="font-bold">AQI {city.value}</span>
              </>
            ) : (
              <div className="font-bold">
                {type === 'hottest' || type === 'coldest' 
                  ? `${city.value.toFixed(1)}°C`
                  : type === 'mostHumid'
                  ? `${city.value}%`
                  : city.value
                }
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const tabs = [
    { key: 'hottest' as RankingType, label: '🔥 最热', icon: Flame },
    { key: 'coldest' as RankingType, label: '❄️ 最冷', icon: Snowflake },
    { key: 'mostHumid' as RankingType, label: '💧 最湿', icon: Droplets },
    { key: 'mostPolluted' as RankingType, label: '🏭 污染', icon: Factory },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          全球城市排行榜
        </CardTitle>
        <CardDescription>
          实时更新的全球城市天气数据排行
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data && (
          <div>
            {/* 简单的标签页切换 */}
            <div className="flex flex-wrap gap-1 mb-4 bg-muted rounded-lg p-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    activeTab === tab.key 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* 排行榜内容 */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
              {renderRankingContent(activeTab)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
