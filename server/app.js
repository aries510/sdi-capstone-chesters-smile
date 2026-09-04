const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
const knex = require('knex')(require('./knexfile.js')['development']);

app.use(express.json());
app.use(cors());

// API homepage route
app.get('/', (request, response) => {
  response.status(418).send('Chester Smiles API Homepage....');
});

// /users route that returns users table
app.use('/users', require('./routes/users'));

// /domain route that returns domains table
app.use('/domains', require('./routes/domains'));

// /personnel route that returns personnel table
app.use('/personnel', require('./routes/personnel'));

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

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
