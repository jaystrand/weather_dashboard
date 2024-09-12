import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
const express = require('express');
const axios = require('axios');
const City = require('../models/City');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const response = await axios.get(`${WEATHER_API_BASE_URL}`, {
      params: {
        q: cityName,
        appid: WEATHER_API_KEY,
        units: 'metric',
      }
    });
  const weatherData = response.data;

  await City.findOneAndUpdate(
    { name: cityName },
    { name: cityName },
    { upsert: true, new: true }
  );

} catch (error) {
  console.error('Error while getting weather data', error);

  if (error.response && error.response.status === 404) {
    return res.status(404).json({ message: 'City not found' });
  }

  res.status(500).json({ error: 'Internal server error occured while getting weather data' });
}
});

// TODO: GET search history
router.get('/history', async (req, res) => {});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {});

export default router;
