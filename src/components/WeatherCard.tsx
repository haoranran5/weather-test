import React from 'react';
import { Weather } from '@/types/weather';
import { formatTime, getWeatherIcon, getWindDirection, getWindLevel } from '@/utils/weather';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Droplets, Wind, Eye, MapPin, Sunrise, Gauge } from 'lucide-react';

interface WeatherCardProps {
  weather: Weather;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const windDirection = weather.wind.deg ? getWindDirection(weather.wind.deg) : '';
  const windLevel = getWindLevel(weather.wind.speed);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{weather.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {weather.sys?.country}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-sm text-muted-foreground">
              体感 {Math.round(weather.main.feels_like)}°C
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 天气描述 */}
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <span className="text-4xl mr-3">
            {getWeatherIcon(weather.weather[0].main, String(weather.weather[0].id))}
          </span>
          <div className="text-center">
            <div className="text-lg font-medium">
              {weather.weather[0].description}
            </div>
            {weather.main.temp_min && weather.main.temp_max && (
              <div className="text-sm text-muted-foreground mt-1">
                {Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 详细信息网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">湿度</span>
            </div>
            <div className="text-2xl font-bold">{weather.main.humidity}%</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">风速</span>
            </div>
            <div className="text-2xl font-bold">{weather.wind.speed} m/s</div>
            {windDirection && (
              <div className="text-xs text-muted-foreground mt-1">{windDirection}</div>
            )}
            <Badge variant="outline" className="text-xs mt-1">{windLevel}</Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">气压</span>
            </div>
            <div className="text-2xl font-bold">{weather.main.pressure}</div>
            <div className="text-xs text-muted-foreground">hPa</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sunrise className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">日出/日落</span>
            </div>
            <div className="text-sm font-bold">
              {formatTime(weather.sys.sunrise, weather.timezone)}
            </div>
            <div className="text-sm font-bold">
              {formatTime(weather.sys.sunset, weather.timezone)}
            </div>
          </Card>

          {weather.visibility && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-cyan-500" />
                <span className="text-sm font-medium">能见度</span>
              </div>
              <div className="text-2xl font-bold">
                {(weather.visibility / 1000).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">km</div>
            </Card>
          )}

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">坐标</span>
            </div>
            <div className="text-sm font-bold">
              {weather.coord.lat.toFixed(2)}°
            </div>
            <div className="text-sm font-bold">
              {weather.coord.lon.toFixed(2)}°
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
