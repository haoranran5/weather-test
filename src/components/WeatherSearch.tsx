import React, { useState } from 'react';
import { POPULAR_CITIES } from '@/constants/cities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  loading: boolean;
}

export default function WeatherSearch({ onSearch, onLocationSearch, loading }: WeatherSearchProps) {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    onSearch(cityName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          天气查询
        </CardTitle>
        <CardDescription>
          搜索全球任意城市的实时天气信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 搜索框 */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="输入城市名（中文或英文）"
            className="flex-1"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !city.trim()}
            className="px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                搜索中
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </>
            )}
          </Button>
        </form>

        {/* 定位按钮 */}
        <Button
          variant="outline"
          onClick={onLocationSearch}
          className="w-full"
          disabled={loading}
        >
          <MapPin className="mr-2 h-4 w-4" />
          获取当前位置天气
        </Button>

        {/* 热门城市快捷按钮 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">热门城市</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map(cityName => (
              <Badge
                key={cityName}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleCityClick(cityName)}
              >
                {cityName}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
