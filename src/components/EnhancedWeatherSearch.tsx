import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Clock, X, Loader2 } from 'lucide-react';
import { searchCities, type CityData } from '@/lib/cities-data';
import { debounce, storage } from '@/lib/utils';

interface EnhancedWeatherSearchProps {
  onSearch: (cityName: string) => void;
  onLocationSearch: () => void;
  loading: boolean;
  temperatureUnit: 'C' | 'F';
  onTemperatureUnitChange: (unit: 'C' | 'F') => void;
}

export default function EnhancedWeatherSearch({ 
  onSearch, 
  onLocationSearch, 
  loading, 
  temperatureUnit, 
  onTemperatureUnitChange 
}: EnhancedWeatherSearchProps) {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载搜索历史
  useEffect(() => {
    const history = storage.get('weather-search-history') || [];
    setSearchHistory(history);
  }, []);

  // 防抖搜索建议
  const debouncedSearch = debounce((query: string) => {
    if (query.length >= 1) {
      const results = searchCities(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      performSearch(city.trim());
    }
  };

  const performSearch = (searchTerm: string) => {
    onSearch(searchTerm);
    addToHistory(searchTerm);
    setCity(searchTerm);
    setShowSuggestions(false);
  };

  const addToHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5);
    setSearchHistory(newHistory);
    storage.set('weather-search-history', newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    storage.remove('weather-search-history');
  };

  const handleSuggestionClick = (suggestion: CityData) => {
    performSearch(suggestion.name);
  };

  const handleHistoryClick = (historyItem: string) => {
    performSearch(historyItem);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            天气查询
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">温度单位:</span>
            <div className="flex rounded-lg border">
              <Button
                variant={temperatureUnit === 'C' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTemperatureUnitChange('C')}
                className="rounded-r-none"
              >
                °C
              </Button>
              <Button
                variant={temperatureUnit === 'F' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTemperatureUnitChange('F')}
                className="rounded-l-none"
              >
                °F
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder="输入城市名（中文或英文）"
                value={city}
                onChange={handleInputChange}
                onFocus={() => city.length >= 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                disabled={loading}
                className="flex-1"
              />
              
              {/* 搜索建议下拉框 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">{suggestion.nameEn}, {suggestion.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading || !city.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  搜索中
                </>
              ) : (
                "搜索"
              )}
            </Button>
          </form>
        </div>
        
        {/* 搜索历史 */}
        {searchHistory.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                搜索历史
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                清除
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button
          onClick={onLocationSearch}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {loading ? "获取位置中..." : "获取当前位置天气"}
        </Button>
      </CardContent>
    </Card>
  );
}
