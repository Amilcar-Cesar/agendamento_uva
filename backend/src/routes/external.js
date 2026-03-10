const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/cep/:cep', async (req, res) => {
  const { cep } = req.params;
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      return res.status(404).json({ message: 'CEP não encontrado' });
    }
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao consultar CEP' });
  }
});

router.get('/weather', async (req, res) => {
  const { city, date } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: 'API key do WeatherAPI não configurada' });
  }

  if (!city) {
    return res
      .status(400)
      .json({ message: 'Cidade é obrigatória para consulta de clima' });
  }

  try {
    const response = await axios.get(
      'https://api.weatherapi.com/v1/forecast.json',
      {
        params: {
          key: apiKey,
          q: city,
          days: 7,
          lang: 'pt'
        }
      }
    );

    const forecastDays =
      (response.data.forecast && response.data.forecast.forecastday) || [];

    let selectedDays = forecastDays;

    if (date) {
      selectedDays =
        forecastDays.filter((d) => d.date === date) || forecastDays;
    }

    const list = selectedDays
      .filter((d) => d && d.day)
      .map((d) => ({
        dt_txt: d.date,
        main: {
          temp: d.day.avgtemp_c
        },
        weather: [
          {
            description: d.day.condition ? d.day.condition.text : ''
          }
        ],
        raw: d
      }));

    return res.json({
      city: response.data.location,
      list
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao consultar clima' });
  }
});

module.exports = router;

