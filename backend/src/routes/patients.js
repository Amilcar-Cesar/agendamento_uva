const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', (req, res) => {
  const {
    name,
    cpf,
    birth_date,
    phone,
    cep,
    street,
    number,
    complement,
    neighborhood,
    city,
    state
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nome do paciente é obrigatório' });
  }

  const stmt = db.prepare(
    `INSERT INTO patients
    (name, cpf, birth_date, phone, cep, street, number, complement, neighborhood, city, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  stmt.run(
    name,
    cpf || null,
    birth_date || null,
    phone || null,
    cep || null,
    street || null,
    number || null,
    complement || null,
    neighborhood || null,
    city || null,
    state || null,
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao cadastrar paciente' });
      }
      return res.status(201).json({ id: this.lastID, name });
    }
  );
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao listar pacientes' });
    }
    return res.json(rows);
  });
});

module.exports = router;

