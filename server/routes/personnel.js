const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { name, firstName, lastName, rank } = req.query;
  const query = knex('personnel').select('*');

  if (name) {
    query.whereRaw("first_name || ' ' || last_name ilike ?", [name]);
  }
  if (firstName) {
    query.where('first_name', 'ilike', firstName);
  }
  if (lastName) {
    query.where('last_name', 'ilike', lastName);
  }
  if (rank) {
    query.where('rank', 'ilike', rank);
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

  knex('personnel')
    .select('*')
    .where('id', personId)
    .first()
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'person not found' });
      }
      res.status(200).json(person);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { rank, first_name, last_name } = req.body;
  if (!rank || !first_name || !last_name) {
    return res
      .status(400)
      .json({ error: 'rank/first_name/last_name are required' });
  }

  knex('personnel')
    .select('id')
    .where('last_name', 'ilike', last_name)
    .andWhere('first_name', 'ilike', first_name)
    .first()
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ error: 'person already exists' });
      }

      return knex('personnel')
        .insert({ rank, last_name, first_name })
        .returning('*')
        .then(([newPerson]) => res.status(201).json(newPerson));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:personId', (req, res) => {
  const { personId } = req.params;
  const { rank, last_name, first_name } = req.body;

  if (!/^\d+$/.test(personId)) {
    return res
      .status(400)
      .json({ error: 'personId must be a positive integer' });
  }

  if (!rank && !last_name && !first_name) {
    return res.status(400).json({ error: 'rank or name is required' });
  }

  knex('personnel')
    .select('id')
    .where('id', personId)
    .first()
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'person not found' });
      }

      return knex('personnel')
        .where('id', personId)
        .update({ rank, last_name, first_name })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/', (req, res) => {
  const { name } = req.query;
  const {
    rank: newRank,
    last_name: newLastName,
    first_name: newFirstName,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  if (!newRank && !newLastName && !newFirstName) {
    return res.status(400).json({ error: 'rank or name is required' });
  }

  knex('personnel')
    .select('id')
    .whereRaw("first_name || ' ' || last_name ilike ?", [name])
    .first()
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'person not found' });
      }

      return knex('personnel')
        .where('id', person.id)
        .update({
          rank: newRank,
          last_name: newLastName,
          first_name: newFirstName,
        })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:personId', (req, res) => {
  const { personId } = req.params;

  if (!/^\d+$/.test(personId)) {
    return res
      .status(400)
      .json({ error: 'personId must be a positive integer' });
  }

  knex('personnel')
    .where('id', personId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'person not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  knex('personnel')
    .select('id')
    .whereRaw("first_name || ' ' || last_name ilike ?", [name])
    .first()
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'person not found' });
      }

      return knex('personnel')
        .where('id', person.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res.status(404).json({ error: 'person not found' });
          }
          res.status(204).end();
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
