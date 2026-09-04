const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');

app.use(express.json());
app.use(cors());

// API homepage route
app.get('/', (request, response) => {
  response.status(418).send('Chester Smiles API Homepage....');
});

app.get('/brew', (req, res) => {
  res.status(418).json({
    error: "I'm a teapot",
    message: 'This server refuses to brew coffee because it is a teapot.',
  });
});

// /users route that returns users table
app.use('/users', require('./routes/users'));

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
app.use('/crewroles', require('./routes/crewRoles'));

// /certs route returns certifications table
app.use('/certs', require('./routes/certs'));

// /quals route returns crew_qualifications table
app.use('/quals', require('./routes/crewQualifications'));

// /perscerts route returns personnel_certifications table
app.use('/perscerts', require('./routes/personnelCertifications'));

// /crewcerts route returns crew_role_certifications
app.use('/crewcerts', require('./routes/crewCertifications'));

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);
