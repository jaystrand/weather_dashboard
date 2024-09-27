import { Router, type Request, type Response } from 'express';
const router = Router();
import "dotenv/config";
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


const WEATHER_API_KEY:string = process.env.API_KEY || '';
const WEATHER_API_BASE_URL:string = process.env.API_BASE_URL || '';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const url = new URL(WEATHER_API_BASE_URL);
    url.searchParams.append('q', cityName);
    url.searchParams.append('appid', WEATHER_API_KEY);
    url.searchParams.append('units', 'metric');
    console.log(url.toString());

    const response = await WeatherService.getWeatherForCity(cityName);

    HistoryService.addCity(cityName);
    

    

    

    res.status(200).json(response);

  } catch (error) {
    console.error('Error while getting weather data', error);
    res.status(500).json({ error: 'Internal server error occurred while getting weather data' });
  }
});

// GET search history
router.get('/history', async (req, res) => {
  try {
    //const cities = await City.find({});
    const cities = await HistoryService.getCities();
    res.status(200).json(cities);
    
  } catch (error) {
    console.error('Error while getting search history', error);
    res.status(500).json({ error: 'Internal server error occurred while getting search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    HistoryService.removeCity(id);
    
    
    res.status(204).send();
  } catch (error) {
    console.error('Error while deleting city from search history', error);
    res.status(500).json({ error: 'Internal server error occurred while deleting city from search history' });
  }
});

export default router;