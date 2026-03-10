const express = require('express');
const axios = require('axios');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', (req, res) => {
  const { patient_id, date, time, reason, notes } = req.body;

  if (!patient_id || !date || !time) {
    return res
      .status(400)
      .json({ message: 'Paciente, data e horário são obrigatórios' });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  db.get(
    `
      SELECT
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      FROM patients
      WHERE id = ?
    `,
    [patient_id],
    async (err, patient) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Erro ao buscar dados do paciente' });
      }

      let weatherJson = null;
      let addressSnapshot = null;

      if (patient) {
        addressSnapshot = JSON.stringify({
          cep: patient.cep,
          street: patient.street,
          number: patient.number,
          complement: patient.complement,
          neighborhood: patient.neighborhood,
          city: patient.city,
          state: patient.state
        });
      }

      if (patient && patient.city && apiKey) {
        try {
          const response = await axios.get(
            'https://api.weatherapi.com/v1/forecast.json',
            {
              params: {
                key: apiKey,
                q: patient.city,
                days: 7,
                lang: 'pt'
              }
            }
          );

          const forecastDays =
            (response.data.forecast && response.data.forecast.forecastday) ||
            [];

          let targetDay = null;

          if (date) {
            targetDay =
              forecastDays.find((d) => d.date === date) || forecastDays[0];
          } else {
            targetDay = forecastDays[0];
          }

          if (targetDay && targetDay.day) {
            const normalized = {
              main: {
                temp: targetDay.day.avgtemp_c
              },
              weather: [
                {
                  description: targetDay.day.condition
                    ? targetDay.day.condition.text
                    : ''
                }
              ],
              // Mantém o payload bruto para futuras evoluções se necessário
              raw: targetDay
            };

            weatherJson = JSON.stringify(normalized);
          }
        } catch (weatherErr) {
          // Não falha o agendamento se a API de clima der erro
          weatherJson = null;
        }
      }

      const stmt = db.prepare(
        `INSERT INTO appointments
        (patient_id, date, time, reason, notes, created_by, weather_json, address_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      stmt.run(
        patient_id,
        date,
        time,
        reason || null,
        notes || null,
        req.user.id,
        weatherJson,
        addressSnapshot,
        function (insertErr) {
          if (insertErr) {
            return res
              .status(500)
              .json({ message: 'Erro ao cadastrar consulta' });
          }

          return res.status(201).json({
            id: this.lastID,
            patient_id,
            date,
            time,
            weather_json: weatherJson ? JSON.parse(weatherJson) : null,
            address_snapshot: addressSnapshot
              ? JSON.parse(addressSnapshot)
              : null
          });
        }
      );
    }
  );
});

router.get('/', (req, res) => {
  const query = `
    SELECT
      a.id,
      a.date,
      a.time,
      a.reason,
      a.notes,
      a.weather_json,
      a.address_snapshot,
      p.id as patient_id,
      p.name as patient_name,
      p.cep,
      p.city,
      p.state
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    ORDER BY a.date, a.time
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao listar consultas' });
    }

    const safeRows = rows.map((row) => {
      let weather = null;
      let address = null;

      if (row.weather_json) {
        try {
          weather = JSON.parse(row.weather_json);
        } catch (e) {
          weather = null;
        }
      }

      if (row.address_snapshot) {
        try {
          address = JSON.parse(row.address_snapshot);
        } catch (e) {
          address = null;
        }
      }

      return {
        ...row,
        weather_json: weather,
        address_snapshot: address
      };
    });

    return res.json(safeRows);
  });
});

module.exports = router;

