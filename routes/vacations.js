const express = require('express');
const router = express.Router();
const store = require('../store');

// Cuenta días hábiles (lun–vie) entre dos fechas inclusive.
function countBusinessDays(startStr, endStr) {
  const end = new Date(endStr);
  let count = 0;
  const cur = new Date(startStr);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function applyDateFilters(list, query) {
  let result = list;
  if (query.date)         result = result.filter(v => v.start_date === query.date);
  if (query.end_date)     result = result.filter(v => v.end_date === query.end_date);
  if (query.end_after)    result = result.filter(v => v.end_date >= query.end_after);
  if (query.start_before) result = result.filter(v => v.start_date <= query.start_before);
  if (query.employee_id)  result = result.filter(v => v.employee_id === parseInt(query.employee_id, 10));
  return result;
}

function paginate(data, query) {
  const page    = Math.max(1, parseInt(query.page)     || 1);
  const perPage = Math.max(1, parseInt(query.per_page) || 25);
  const total       = data.length;
  const totalPages  = Math.max(1, Math.ceil(total / perPage));
  const start       = (page - 1) * perPage;
  const sliced      = data.slice(start, start + perPage);
  return {
    pagination: {
      next:        page < totalPages ? page + 1 : null,
      previous:    page > 1         ? page - 1 : null,
      count:       sliced.length,
      total_pages: totalPages,
    },
    data: sliced,
  };
}

// IMPORTANTE: las rutas con segmentos fijos deben ir ANTES de /:id.

// GET /vacations/business_days
router.get('/business_days', (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    return res.status(400).json({ errors: ['Se requieren start_date y end_date'] });
  }
  return res.json({ business_days: countBusinessDays(start_date, end_date) });
});

// GET /vacations/requested
router.get('/requested', (req, res) => {
  const requested = store.vacations.filter(v => v.status === 'requested');
  return res.json(paginate(requested, req.query));
});

// GET /vacations
router.get('/', (req, res) => {
  const filtered = applyDateFilters(store.vacations, req.query);
  return res.json(paginate(filtered, req.query));
});

// GET /vacations/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['ID inválido'] });

  const vacation = store.vacations.find(v => v.id === id);
  if (!vacation) return res.status(404).json({ errors: ['Vacación no encontrada'] });
  return res.json(vacation);
});

// POST /vacations
router.post('/', (req, res) => {
  const { employee_id, start_date, end_date, type } = req.body || {};
  const errors = [];
  if (!employee_id) errors.push('employee_id es requerido');
  if (!start_date)  errors.push('start_date es requerido');
  if (!end_date)    errors.push('end_date es requerido');
  if (!type)        errors.push('type es requerido');
  if (errors.length) return res.status(400).json({ errors });

  const today = new Date().toISOString().split('T')[0];
  const newVacation = {
    id:              store._nextVacationId++,
    employee_id:     parseInt(employee_id, 10),
    approved_by_id:  null,
    working_days:    countBusinessDays(start_date, end_date),
    calendar_days:   Math.round((new Date(end_date) - new Date(start_date)) / 86400000) + 1,
    workday_stage:   'full_working_day',
    start_date,
    end_date,
    requested_at:    today,
    approved_at:     null,
    type,
    status:          'requested',
    vacation_type_id: 2,
  };
  store.vacations.push(newVacation);
  return res.status(201).json(newVacation);
});

// DELETE /vacations  (id en body o query)
router.delete('/', (req, res) => {
  const rawId = (req.body && req.body.id) || req.query.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return res.status(400).json({ errors: ['id es requerido'] });

  const idx = store.vacations.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ errors: ['Vacación no encontrada'] });

  store.vacations.splice(idx, 1);
  return res.json({ message: 'Vacación eliminada correctamente' });
});

module.exports = router;
