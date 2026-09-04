const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { member } = req.query;

  const query = knex('crew_qualifications')
    .select('personnel.id as personId')
    .select('personnel.rank')
    .select(
      knex.raw("personnel.first_name || ' ' || personnel.last_name as member"),
    )
    .select(
      knex.raw(`json_agg(json_build_object(
        'roleId', crew_roles.id,
        'role', crew_roles.name,
        'systemId', weapon_systems.id,
        'system', weapon_systems.name,
        'qualified_date', crew_qualifications.qualified_date,
        'is_current', crew_qualifications.qualified_date + interval '1 year' >= CURRENT_DATE
      )) as qualifications`),
    )
    .join('personnel', 'crew_qualifications.personnel_id', '=', 'personnel.id')
    .join(
      'crew_roles',
      'crew_roles.id',
      '=',
      'crew_qualifications.crew_role_id',
    )
    .join(
      'weapon_systems',
      'weapon_systems.id',
      '=',
      'crew_qualifications.system_id',
    )
    .groupBy('personnel.id');

  if (member) {
    query.whereRaw(
      "personnel.first_name || ' ' || personnel.last_name ilike ?",
      [member],
    );
  }

  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:personId', (req, res) => {
  const { personId } = req.params;

  if (!/^\d+$/.test(personId)) {
    return res
      .status(400)
      .json({ error: 'personId must be a positive integer' });
  }

  const query = knex('crew_qualifications')
    .select('personnel.id as personId')
    .select('personnel.rank')
    .select(
      knex.raw("personnel.first_name || ' ' || personnel.last_name as member"),
    )
    .select(
      knex.raw(`json_agg(json_build_object(
        'roleId', crew_roles.id,
        'role', crew_roles.name,
        'systemId', weapon_systems.id,
        'system', weapon_systems.name,
        'qualified_date', crew_qualifications.qualified_date,
        'is_current', crew_qualifications.qualified_date + interval '1 year' >= CURRENT_DATE
      )) as qualifications`),
    )
    .where('crew_qualifications.personnel_id', personId)
    .join('personnel', 'crew_qualifications.personnel_id', '=', 'personnel.id')
    .join(
      'crew_roles',
      'crew_roles.id',
      '=',
      'crew_qualifications.crew_role_id',
    )
    .join(
      'weapon_systems',
      'weapon_systems.id',
      '=',
      'crew_qualifications.system_id',
    )
    .groupBy('personnel.id');

  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { member, role, system, qualified_date } = req.body;

  if (!member || !role || !system || !qualified_date) {
    return res.status(400).json({ error: 'missing required data' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .whereRaw("first_name || ' ' || last_name ilike ?", [member])
      .first(),
    knex('crew_roles').select('id').where('name', 'ilike', role).first(),
    knex('weapon_systems').select('id').where('name', 'ilike', system).first(),
  ])
    .then(([person, crewRole, weaponSystem]) => {
      if (!person || !crewRole || !weaponSystem) {
        return res
          .status(404)
          .json({ error: 'member, role, or system not found' });
      }

      return knex('crew_qualifications')
        .insert({
          personnel_id: person.id,
          crew_role_id: crewRole.id,
          system_id: weaponSystem.id,
          qualified_date,
        })
        .then(() => res.status(201).json({ message: 'Successfully created' }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:personId/:roleId/:systemId', (req, res) => {
  const { personId, roleId, systemId } = req.params;
  const { qualified_date } = req.body;

  if (
    !/^\d+$/.test(personId) ||
    !/^\d+$/.test(roleId) ||
    !/^\d+$/.test(systemId)
  ) {
    return res.status(400).json({ error: "Id's must be positive integers" });
  }

  if (!qualified_date) {
    return res.status(400).json({ error: 'qualified_date is required' });
  }

  knex('crew_qualifications')
    .where('personnel_id', personId)
    .andWhere('crew_role_id', roleId)
    .andWhere('system_id', systemId)
    .update({ qualified_date })
    .then((updatedCount) => {
      if (!updatedCount) {
        return res.status(404).json({ error: 'not found' });
      }
      res.status(200).json({ message: 'Successfully updated' });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/', (req, res) => {
  const { member, role, system } = req.query;
  const { qualified_date } = req.body;

  if (!member || !role || !system) {
    return res
      .status(400)
      .json({ error: 'member/role/system query parameters are required' });
  }

  if (!qualified_date) {
    return res.status(400).json({ error: 'qualified_date is required' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .whereRaw("first_name || ' ' || last_name ilike ?", [member])
      .first(),
    knex('crew_roles').select('id').where('name', 'ilike', role).first(),
    knex('weapon_systems').select('id').where('name', 'ilike', system).first(),
  ])
    .then(([person, crewRole, weaponSystem]) => {
      if (!person || !crewRole || !weaponSystem) {
        return res.status(404).json({ error: 'member/role/system not found' });
      }

      return knex('crew_qualifications')
        .where('personnel_id', person.id)
        .andWhere('crew_role_id', crewRole.id)
        .andWhere('system_id', weaponSystem.id)
        .update({ qualified_date })
        .then((updatedCount) => {
          if (!updatedCount) {
            return res.status(404).json({ error: 'not found' });
          }
          res.status(200).json({ message: 'Successfully updated' });
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:personId/:roleId/:systemId', (req, res) => {
  const { personId, roleId, systemId } = req.params;
  if (
    !/^\d+$/.test(personId) ||
    !/^\d+$/.test(roleId) ||
    !/^\d+$/.test(systemId)
  ) {
    return res.status(400).json({ error: "Id's must be positive integers" });
  }
  knex('crew_qualifications')
    .where('personnel_id', personId)
    .andWhere('crew_role_id', roleId)
    .andWhere('system_id', systemId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/', (req, res) => {
  const { member, role, system } = req.query;

  if (!member || !role || !system) {
    return res
      .status(400)
      .json({ error: 'member/role/system query parameters are required' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .whereRaw("first_name || ' ' || last_name ilike ?", [member])
      .first(),
    knex('crew_roles').select('id').where('name', 'ilike', role).first(),
    knex('weapon_systems').select('id').where('name', 'ilike', system).first(),
  ])
    .then(([person, crewRole, weaponSystem]) => {
      if (!person || !crewRole || !weaponSystem) {
        return res.status(404).json({ error: 'member/role/system not found' });
      }

      return knex('crew_qualifications')
        .where('personnel_id', person.id)
        .andWhere('crew_role_id', crewRole.id)
        .andWhere('system_id', weaponSystem.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res.status(404).json({ error: 'not found' });
          }
          res.status(204).end();
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
