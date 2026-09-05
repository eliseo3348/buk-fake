# buk-fake

Mock REST API en Node.js + Express que simula un subconjunto de la API de BUK para desarrollo local y pruebas con el agente de ElevenLabs.

Los datos viven en memoria: cada reinicio del servidor resetea el estado al seed original (`data/seed.js`).

**IDs de empleados disponibles:** 101 – 105
**ID que no existe (para probar 404):** 999

---

## Instalación y ejecución

```bash
cp .env.example .env   # ajusta PORT si necesitas otro puerto
npm install
npm start              # producción
npm run dev            # desarrollo con recarga automática (nodemon)
```

---

## Autenticación

BUK espera el header `auth_token`. El mock lo acepta pero **no valida** su valor — cualquier string (o ninguno) pasa igual.

---

## Ejemplos de curl

### Persona por ID
```bash
# Existe
curl -H "auth_token: mi-token-de-prueba" http://localhost:3000/people/101

# No existe → 404
curl -H "auth_token: mi-token-de-prueba" http://localhost:3000/people/999
```

### Vacaciones
```bash
# Listado con filtro de fecha
curl -H "auth_token: mi-token-de-prueba" \
  "http://localhost:3000/vacations?start_before=2024-06-01"

# Crear una solicitud
curl -X POST http://localhost:3000/vacations \
  -H "auth_token: mi-token-de-prueba" \
  -H "Content-Type: application/json" \
  -d '{"employee_id":101,"start_date":"2024-09-01","end_date":"2024-09-10","type":"legales"}'

# Días hábiles entre dos fechas
curl -H "auth_token: mi-token-de-prueba" \
  "http://localhost:3000/vacations/business_days?start_date=2024-09-01&end_date=2024-09-10"
```

### Licencias
```bash
# Listado de tipos
curl -H "auth_token: mi-token-de-prueba" http://localhost:3000/absences/licence/types

# Licencia específica
curl -H "auth_token: mi-token-de-prueba" http://localhost:3000/absences/licence/3

# Crear una licencia
curl -X POST http://localhost:3000/absences/licence \
  -H "auth_token: mi-token-de-prueba" \
  -H "Content-Type: application/json" \
  -d '{"employee_id":102,"start_date":"2024-10-01","days_count":5,"type":"médica","motivo":"Gripe"}'

# Borrar por ID (path)
curl -X DELETE http://localhost:3000/absences/licence/2 \
  -H "auth_token: mi-token-de-prueba"
```

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/people/:id` | Persona por ID |
| GET | `/vacations` | Lista de vacaciones (filtros: `date`, `end_date`, `end_after`, `start_before`) |
| GET | `/vacations/requested` | Solo vacaciones pendientes |
| GET | `/vacations/business_days` | Días hábiles (`start_date`, `end_date` requeridos) |
| GET | `/vacations/:id` | Vacación por ID |
| POST | `/vacations` | Crear solicitud (`employee_id`, `start_date`, `end_date`, `type`) |
| DELETE | `/vacations` | Eliminar por `id` en body o query |
| GET | `/absences/licence/types` | Tipos de licencia |
| GET | `/absences/licence/types/:id` | Tipo de licencia por ID |
| GET | `/absences/licence` | Lista de licencias |
| GET | `/absences/licence/:id` | Licencia por ID |
| POST | `/absences/licence` | Crear licencia (`employee_id`, `start_date`, `days_count`, `type`) |
| DELETE | `/absences/licence` | Eliminar por `id` en body o query |
| DELETE | `/absences/licence/:id` | Eliminar por ID en path |
