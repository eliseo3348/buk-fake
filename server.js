require('dotenv').config();
const express = require('express');

const logger        = require('./middleware/logger');
const peopleRouter  = require('./routes/people');
const vacationsRouter = require('./routes/vacations');
const absencesRouter  = require('./routes/absences');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

app.use('/people',    peopleRouter);
app.use('/vacations', vacationsRouter);
app.use('/absences',  absencesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ errors: ['Ruta no encontrada'] }));

app.listen(PORT, () => {
  console.log(`BUK mock API corriendo en puerto ${PORT}`);
});
