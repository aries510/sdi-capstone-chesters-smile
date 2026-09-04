const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
const knex = require('knex')(require('./knexfile.js')['development']);

const users = require('./users.js')

app.use(express.json());
app.use(cors());

app.use('/users', users)

// API homepage route
app.get('/', (request, response) => {
  response.status(200).send('Chester Smiles API Homepage....');
});

/* /users route that returns users table
transferred to users.js via express.router

app.get('/users', (request, response) => {
  knex('users')
    .select('*')
    .then((users) => response.json(users));
});
*/

// /domain route that returns domain table
app.get('/domain', (request, response) => {
    knex('domains')
        .select('*')
        .then(domain => response.json(domain))
});

// Route for domain per the id
app.get('/domain/:id', (request, response) => {
    const { id } = request.params

    knex('domains')
        .where('id', id)
        .first()
        .then(domain => response.json(domain))
});

// /personnel route that returns personnel table
app.get('/personnel/:id', (request, response) => {
    const { id } = request.params;

    knex('personnel')
        .where('id', id)
        .first()
        .then(personnel => response.json(personnel))
});

// /weaponsystems route that returns weapon_systems table
app.get('/weaponsystems', (request, response) => {
    knex('weapon_systems')
        .join('domains', 'weapon_systems.domain_id', '=', 'domains.id')
        .select(
            'weapon_systems.id', 
            'weapon_systems.name', 
            'weapon_systems.acronym', 
            'weapon_systems.description', 
            'domains.name as domain'
        )
        .then(systems => response.json(systems))
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
<<<<<<< Updated upstream
  knex('crew_qualifications')
    .select('*')
    .then((quals) => response.json(quals));
=======
    knex('crew_qualifications')
        .innerJoin('personnel', 'crew_qualifications.personnel_id', '=', 'personnel.id')
        .innerJoin('crew_roles', 'crew_qualifications.crew_role_id', '=', 'crew_roles.id')
        .innerJoin('weapon_systems', 'weapon_systems.id', '=', 'crew_qualifications.system_id')
        .select(
            'crew_qualifications.id',
            'personnel.last_name as personnel',
            'crew_roles.name as crew_roles',
            'weapon_systems.name as weapon_systems'
        )
        .then(quals => response.json(quals))
>>>>>>> Stashed changes
});

// /perscerts route returns personnel_certifications table
app.use('/perscerts', require('./routes/personnelCertifications'));

// /crewcerts route returns crew_role_certifications
app.use('/crewcerts', require('./routes/crewCertifications'));

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
