import "dotenv/config";
import axios from 'axios';


// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string = '';
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;

  constructor(date: string, tempF: number, windSpeed: number, humidity: number, icon: string, iconDescription: string) {        
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  
  }
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await axios.get<any[]>(url);
    return response.data[0];
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon
    };
  }

  private buildGeocodeQuery(): string {
    return `${this.cityName}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {    
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await axios.get(url);
    return response.data;
  }

  private parseCurrentWeather(response: any): Weather {
    const currentRaw = response.list[0];
    return new Weather(
      new Date(currentRaw.dt * 1000).toLocaleDateString(),
      currentRaw.main.temp,
      currentRaw.wind.speed,
      currentRaw.main.humidity,
      currentRaw.weather[0].icon,
      currentRaw.weather[0].description,
    );
  }

  private isAM() {  return new Date().getHours() < 12;}

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecast = [currentWeather];
    const fiveDay = weatherData.filter((day) => {
      return day.dt_txt.includes("12:00:00");
    })
    const startIndex = this.isAM() ? 1 : 0;
    for (let i = startIndex; i < startIndex+5; i++) {
      const day = fiveDay[i];
      forecast.push(
        new Weather(
          new Date(day.dt * 1000).toLocaleDateString(),
          day.main.temp,
          day.wind.speed,
          day.main.humidity,
          day.weather[0].icon,
          day.weather[0].description,
        )
      );
    }
    return forecast;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    return this.buildForecastArray(currentWeather, weatherData.list);
  }
}

export default new WeatherService();