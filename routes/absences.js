const express = require('express');
const router = express.Router();
const store = require('../store');

// IMPORTANTE: rutas con segmentos fijos van ANTES de /:id.

// GET /absences/licence/types
router.get('/licence/types', (req, res) => {
  return res.json({ data: store.licenceTypes });
});

// GET /absences/licence/types/:id
router.get('/licence/types/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['ID inválido'] });

  const licenceType = store.licenceTypes.find(lt => lt.id === id);
  if (!licenceType) return res.status(404).json({ errors: ['Tipo de licencia no encontrado'] });
  return res.json({ data: licenceType });
});

// GET /absences/licence
router.get('/licence', (req, res) => {
  let result = store.licences;
  if (req.query.employee_id) result = result.filter(l => l.employee_id === parseInt(req.query.employee_id, 10));
  return res.json({ data: result });
});

// GET /absences/licence/:id
router.get('/licence/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['ID inválido'] });

  const licence = store.licences.find(l => l.id === id);
  if (!licence) return res.status(404).json({ errors: ['Licencia no encontrada'] });
  return res.json(licence);
});

// POST /absences/licence
router.post('/licence', (req, res) => {
  const { employee_id, start_date, days_count, type } = req.body || {};
  const errors = [];
  if (!employee_id) errors.push('employee_id es requerido');
  if (!start_date)  errors.push('start_date es requerido');
  if (!days_count)  errors.push('days_count es requerido');
  if (!type)        errors.push('type es requerido');
  if (errors.length) return res.status(400).json({ errors });

  const now       = new Date().toISOString();
  const startDate = new Date(start_date);
  const endDate   = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseInt(days_count, 10) - 1);
  const end_date  = endDate.toISOString().split('T')[0];

  const newLicence = {
    id:                   store._nextLicenceId++,
    employee_id:          parseInt(employee_id, 10),
    start_date,
    end_date,
    days_count:           parseInt(days_count, 10),
    day_percent:          parseFloat(req.body.day_percent) || 1,
    workday_stage:        req.body.workday_stage || 'full_working_day',
    type,
    contribution_days:    parseInt(days_count, 10),
    application_date:     req.body.application_date || start_date,
    application_end_date: req.body.application_end_date || end_date,
    status:               'pendiente',
    created_at:           now,
    updated_at:           now,
    motivo:               req.body.motivo || '',
    format:               req.body.format || 'electronica',
    licence_type_id:      req.body.licence_type_id || null,
    licence_type_code:    req.body.licence_type_code || null,
    custom_attributes:    req.body.custom_attributes || {},
  };
  store.licences.push(newLicence);
  return res.status(201).json(newLicence);
});

// DELETE /absences/licence  (id en body o query)
router.delete('/licence', (req, res) => {
  const rawId = (req.body && req.body.id) || req.query.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['id es requerido'] });

  const idx = store.licences.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ errors: ['Licencia no encontrada'] });

  store.licences.splice(idx, 1);
  return res.json({ message: 'Licencia eliminada correctamente' });
});

// DELETE /absences/licence/:id
router.delete('/licence/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['ID inválido'] });

  const idx = store.licences.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ errors: ['Licencia no encontrada'] });

  store.licences.splice(idx, 1);
  return res.json({ message: 'Licencia eliminada correctamente' });
});

module.exports = router;
