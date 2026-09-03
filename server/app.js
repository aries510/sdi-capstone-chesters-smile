const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
const knex = require('knex')(require('./knexfile.js')['development']);

app.use(express.json());
app.use(cors());

// API homepage route
app.get('/', (request, response) => {
  response.status(200).send('Chester Smiles API Homepage....');
});

// /users route that returns users table
app.get('/users', (request, response) => {
  knex('users')
    .select('*')
    .then((users) => response.json(users));
});

// /domain route that returns domain table
app.get('/domain', (request, response) => {
  knex('domains')
    .select('*')
    .then((domain) => response.json(domain));
});

// /personnel route that returns personnel table
app.get('/personnel', (request, response) => {
  knex('personnel')
    .select('*')
    .then((personnel) => response.json(personnel));
});

// /weaponsystems route that returns weapon_systems table
app.get('/weaponsystems', (request, response) => {
  knex('weapon_systems')
    .select('*')
    .then((systems) => response.json(systems));
});

// /crewroles route that returns crew_roles tablea
app.get('/crewroles', (request, response) => {
  knex('crew_roles')
    .select('*')
    .then((roles) => response.json(roles));
});

// /certs route returns certifications table
app.get('/certs', (request, response) => {
  knex('certifications')
    .select('*')
    .then((certs) => response.json(certs));
});

// /quals route returns crew_qualifications table
app.get('/quals', (request, response) => {
  knex('crew_qualifications')
    .select('*')
    .then((quals) => response.json(quals));
});

// /perscerts route returns personnel_certifications table
app.get('/perscerts', (request, response) => {
  knex('personnel_certifications')
    .select('*')
    .then((pcerts) => response.json(pcerts));
});

// /crewcerts route returns crew_role_certifications
app.use('/crewcerts', require('./routes/crewCertifications'));

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
