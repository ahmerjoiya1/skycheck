export interface DayForecast {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

export interface WeatherData {
  city: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    description: string;
    icon: string;
  };
  forecast: DayForecast[];
}