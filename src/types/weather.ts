// 天气相关类型定义

export interface Weather {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
    id: number;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg?: number;
  };
  timezone: number;
  coord: {
    lat: number;
    lon: number;
  };
  visibility?: number;
}

export interface CityWeather {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    humidity: number;
    pressure: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  sys: {
    country: string;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    main: string;
    description: string;
    id: number;
    icon: string;
  }>;
}

export interface CityWithAQI extends CityWeather {
  aqi: number | null;
}

export interface WeatherInfo {
  name: string;
  localName?: string;
  country: string;
  countryName: string;
  value: number;
  extra?: {
    windSpeed?: number;
    pressure?: number;
    visibility?: number;
    feelsLike?: number;
    temp?: number;
  };
}

export interface TopCitiesData {
  hottest: WeatherInfo[];
  coldest: WeatherInfo[];
  mostHumid: WeatherInfo[];
  mostPolluted: WeatherInfo[];
  windiest?: WeatherInfo[];
  lowestPressure?: WeatherInfo[];
  lowVisibility?: WeatherInfo[];
}

export type RankingType = 'hottest' | 'coldest' | 'mostHumid' | 'mostPolluted';

export interface AQIInfo {
  text: string;
  color: string;
  bg: string;
}
