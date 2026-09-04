const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { role } = req.query;
  const query = knex('crew_roles').select('*');

  if (role) {
    query.where('name', 'ilike', role);
  }
  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:roleId', (req, res) => {
  const { roleId } = req.params;

  if (!/^\d+$/.test(roleId)) {
    return res.status(400).json({ error: 'roleId must be a positive integer' });
  }

  knex('crew_roles')
    .select('*')
    .where('id', roleId)
    .first()
    .then((cert) => {
      if (!cert) {
        return res.status(404).json({ error: 'crew role not found' });
      }
      res.status(200).json(cert);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { role, description } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'role is required' });
  }

  knex('crew_roles')
    .select('id')
    .where('name', 'ilike', role)
    .first()
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ error: 'role already exists' });
      }

      return knex('crew_roles')
        .insert({ name: role, description })
        .returning('*')
        .then(([newRole]) => res.status(201).json(newRole));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:roleId', (req, res) => {
  const { roleId } = req.params;
  const { name, description } = req.body;

  if (!/^\d+$/.test(roleId)) {
    return res.status(400).json({ error: 'roleId must be a positive integer' });
  }

  if (!name && description === undefined) {
    return res.status(400).json({ error: 'name or description is required' });
  }

  knex('crew_roles')
    .select('id')
    .where('id', roleId)
    .first()
    .then((role) => {
      if (!role) {
        return res.status(404).json({ error: 'role not found' });
      }

      return knex('crew_roles')
        .where('id', roleId)
        .update({ name, description })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/', (req, res) => {
  const { role } = req.query;
  const { name: newName, description: newDescription } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'role query parameter is required' });
  }

  if (!newName && newDescription === undefined) {
    return res.status(400).json({ error: 'name or description is required' });
  }

  knex('crew_roles')
    .select('id')
    .where('name', 'ilike', role)
    .first()
    .then((crewRole) => {
      if (!crewRole) {
        return res.status(404).json({ error: 'role not found' });
      }

      return knex('crew_roles')
        .where('id', crewRole.id)
        .update({ name: newName, description: newDescription })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/', (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ error: 'role query parameter is required' });
  }

  knex('crew_roles')
    .select('id')
    .where('name', 'ilike', role)
    .first()
    .then((crewRole) => {
      if (!crewRole) {
        return res.status(404).json({ error: 'role not found' });
      }

      return knex('crew_roles')
        .where('id', crewRole.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res.status(404).json({ error: 'role not found' });
          }
          res.status(204).end();
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:roleId', (req, res) => {
  const { roleId } = req.params;

  if (!/^\d+$/.test(roleId)) {
    return res.status(400).json({ error: 'roleId must be a positive integer' });
  }

  knex('crew_roles')
    .where('id', roleId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'role not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
