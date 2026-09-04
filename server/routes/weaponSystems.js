const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { system } = req.query;

  const query = knex('weapon_systems')
    .select(
      'weapon_systems.id',
      'weapon_systems.name',
      'weapon_systems.acronym',
      'weapon_systems.description',
      'domains.name as domain',
    )
    .join('domains', 'domains.id', '=', 'weapon_systems.domain_id');

  if (system) {
    query.where('weapon_systems.name', 'ilike', system);
  }

  query
    .then((systems) => res.status(200).json(systems))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:systemId', (req, res) => {
  const { systemId } = req.params;

  if (!/^\d+$/.test(systemId)) {
    return res
      .status(400)
      .json({ error: 'systemId must be a positive integer' });
  }

  knex('weapon_systems')
    .select(
      'weapon_systems.id',
      'weapon_systems.name',
      'weapon_systems.acronym',
      'weapon_systems.description',
      'domains.name as domain',
    )
    .where('weapon_systems.id', systemId)
    .join('domains', 'domains.id', '=', 'weapon_systems.domain_id')
    .then((systems) => {
      if (!systems[0]) {
        return res.status(404).json({ error: 'weapon system not found' });
      }
      res.status(200).json(systems[0]);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { name, acronym, description, domain } = req.body;
  if (!name || !description || !domain) {
    return res.status(400).json({ error: 'missing required data' });
  }

  Promise.all([
    knex('weapon_systems').select('id').where('name', 'ilike', name).first(),
    knex('domains').select('id').where('name', 'ilike', domain).first(),
  ])
    .then(([existingSystem, domainRow]) => {
      if (existingSystem) {
        return res.status(409).json({ error: 'weapon system already exists' });
      }

      if (!domainRow) {
        return res.status(404).json({ error: 'domain not found' });
      }

      return knex('weapon_systems')
        .insert({ name, acronym, description, domain_id: domainRow.id })
        .returning('*')
        .then(([newSystem]) => res.status(201).json(newSystem));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/', (req, res) => {
  const { system } = req.query;
  const {
    name: newName,
    acronym: newAcronym,
    description: newDescription,
    domain: newDomain,
  } = req.body;

  if (!system) {
    return res
      .status(400)
      .json({ error: 'system query parameter is required' });
  }

  if (!newName && !newAcronym && !newDescription && !newDomain) {
    return res
      .status(400)
      .json({ error: 'name, acronym, description, or domain is required' });
  }

  Promise.all([
    knex('weapon_systems').select('id').where('name', 'ilike', system).first(),
    newDomain
      ? knex('domains').select('id').where('name', 'ilike', newDomain).first()
      : Promise.resolve(null),
  ])
    .then(([weaponSystem, domainRow]) => {
      if (!weaponSystem) {
        return res.status(404).json({ error: 'weapon system not found' });
      }

      if (newDomain && !domainRow) {
        return res.status(404).json({ error: 'domain not found' });
      }

      const updates = {
        name: newName,
        acronym: newAcronym,
        description: newDescription,
      };
      if (domainRow) updates.domain_id = domainRow.id;

      return knex('weapon_systems')
        .where('id', weaponSystem.id)
        .update(updates)
        .then((updatedCount) => {
          if (!updatedCount) {
            return res.status(404).json({ error: 'weapon system not found' });
          }
          res.status(200).json({ message: 'Successfully updated' });
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:systemId', (req, res) => {
  const { systemId } = req.params;
  const {
    name: newName,
    acronym: newAcronym,
    description: newDescription,
    domain: newDomain,
  } = req.body;

  if (!/^\d+$/.test(systemId)) {
    return res
      .status(400)
      .json({ error: 'systemId must be a positive integer' });
  }

  if (!newName && !newAcronym && !newDescription && !newDomain) {
    return res
      .status(400)
      .json({ error: 'name, acronym, description, or domain is required' });
  }

  Promise.all([
    knex('weapon_systems').select('id').where('id', systemId).first(),
    newDomain
      ? knex('domains').select('id').where('name', 'ilike', newDomain).first()
      : Promise.resolve(null),
  ])
    .then(([weaponSystem, domainRow]) => {
      if (!weaponSystem) {
        return res.status(404).json({ error: 'weapon system not found' });
      }

      if (newDomain && !domainRow) {
        return res.status(404).json({ error: 'domain not found' });
      }

      const updates = {
        name: newName,
        acronym: newAcronym,
        description: newDescription,
      };
      if (domainRow) updates.domain_id = domainRow.id;

      return knex('weapon_systems')
        .where('id', weaponSystem.id)
        .update(updates)
        .then((updatedCount) => {
          if (!updatedCount) {
            return res.status(404).json({ error: 'weapon system not found' });
          }
          res.status(200).json({ message: 'Successfully updated' });
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:systemId', (req, res) => {
  const { systemId } = req.params;

  if (!/^\d+$/.test(systemId)) {
    return res
      .status(400)
      .json({ error: 'systemId must be a positive integer' });
  }
  knex('weapon_systems')
    .where('id', systemId)
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
  const { system, acronym } = req.query;

  if (!system && !acronym) {
    return res
      .status(400)
      .json({ error: 'system or acronym query parameter is required' });
  }

  const query = knex('weapon_systems');

  if (system && acronym) {
    query.where('name', 'ilike', system).orWhere('acronym', 'ilike', acronym);
  } else if (system) {
    query.where('name', 'ilike', system);
  } else {
    query.where('acronym', 'ilike', acronym);
  }

  query
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
