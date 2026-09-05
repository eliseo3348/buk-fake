const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /people/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['ID inválido'] });

  const person = store.people.find(p => p.id === id);
  if (!person) return res.status(404).json({ errors: ['Persona no encontrada'] });

  return res.json({ data: person });
});

module.exports = router;
