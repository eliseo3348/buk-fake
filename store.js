// In-memory store inicializado desde el seed.
// Cada reinicio del servidor resetea los datos al estado original.
const seed = require('./data/seed');

const store = {
  people:       JSON.parse(JSON.stringify(seed.people)),
  vacations:    JSON.parse(JSON.stringify(seed.vacations)),
  licenceTypes: JSON.parse(JSON.stringify(seed.licenceTypes)),
  licences:     JSON.parse(JSON.stringify(seed.licences)),
  _nextVacationId: seed.vacations.length + 1,
  _nextLicenceId:  seed.licences.length + 1,
};

module.exports = store;
