const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { role } = req.query;

  if (role) {
    knex('crew_role_certifications')
      .select(
        'crew_roles.name as crew_role',
        'certifications.name as certification',
      )
      .join(
        'crew_roles',
        'crew_role_certifications.crew_role_id',
        '=',
        'crew_roles.id',
      )
      .join(
        'certifications',
        'crew_role_certifications.certifications_id',
        '=',
        'certifications.id',
      )
      .where('crew_roles.name', 'ilike', role)
      .then((crewcerts) => res.json(crewcerts))
      .catch((error) => res.status(500).json({ error: error.message }));
  } else {
    knex('crew_role_certifications')
      .select(
        'crew_roles.name as crew_role',
        'certifications.name as certification',
      )
      .join(
        'crew_roles',
        'crew_role_certifications.crew_role_id',
        '=',
        'crew_roles.id',
      )
      .join(
        'certifications',
        'crew_role_certifications.certifications_id',
        '=',
        'certifications.id',
      )
      .then((crewcerts) => res.json(crewcerts))
      .catch((error) => res.status(500).json({ error: error.message }));
  }
});

router.get('/:roleId', (req, res) => {
  const { roleId } = req.params;

  if (!/^\d+$/.test(roleId)) {
    return res.status(400).json({ error: 'roleId must be a positive integer' });
  }

  knex('crew_role_certifications')
    .select(
      'crew_roles.name as crew_role',
      'certifications.name as certification',
    )
    .where('crew_role_certifications.crew_role_id', roleId)
    .join(
      'crew_roles',
      'crew_role_certifications.crew_role_id',
      '=',
      'crew_roles.id',
    )
    .join(
      'certifications',
      'crew_role_certifications.certifications_id',
      '=',
      'certifications.id',
    )
    .then((crewcerts) => res.json(crewcerts))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/', (req, res) => {
  const { role, cert } = req.query;

  if (!role || !cert) {
    return res
      .status(400)
      .json({ error: 'role and cert query parameters are required' });
  }

  Promise.all([
    knex('crew_roles').select('id').where('name', 'ilike', role).first(),
    knex('certifications').select('id').where('name', 'ilike', cert).first(),
  ])
    .then(([crewRole, certification]) => {
      if (!crewRole || !certification) {
        return res
          .status(404)
          .json({ error: 'crew role or certification not found' });
      }

      return knex('crew_role_certifications')
        .where('crew_role_id', crewRole.id)
        .andWhere('certifications_id', certification.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res
              .status(404)
              .json({ error: 'crew role certification not found' });
          }
          res.status(204).json({ message: 'Successfully deleted' });
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:roleId/:certId', (req, res) => {
  const { roleId, certId } = req.params;

  if (!/^\d+$/.test(roleId) || !/^\d+$/.test(certId)) {
    return res
      .status(400)
      .json({ error: 'roleId and certId must be positive integers' });
  }

  knex('crew_role_certifications')
    .where('crew_role_id', roleId)
    .andWhere('certifications_id', certId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res
          .status(404)
          .json({ error: 'crew role certification not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
