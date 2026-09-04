const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { name } = req.query;
  const query = knex('domains').select('*');

  if (name) {
    query.where('name', 'ilike', name);
  }
  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:domainId', (req, res) => {
  const { domainId } = req.params;

  if (!/^\d+$/.test(domainId)) {
    return res
      .status(400)
      .json({ error: 'domainId must be a positive integer' });
  }

  knex('domains')
    .select('*')
    .where('id', domainId)
    .first()
    .then((domain) => {
      if (!domain) {
        return res.status(404).json({ error: 'domain not found' });
      }
      res.status(200).json(domain);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  knex('domains')
    .select('id')
    .where('name', 'ilike', name)
    .first()
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ error: 'domain already exists' });
      }

      return knex('domains')
        .insert({ name })
        .returning('*')
        .then(([domain]) => res.status(201).json(domain));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:domainId', (req, res) => {
  const { domainId } = req.params;
  const { name } = req.body;

  if (!/^\d+$/.test(domainId)) {
    return res
      .status(400)
      .json({ error: 'domainId must be a positive integer' });
  }

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  knex('domains')
    .select('id')
    .where('id', domainId)
    .first()
    .then((domain) => {
      if (!domain) {
        return res.status(404).json({ error: 'domain not found' });
      }

      return knex('domains')
        .where('id', domainId)
        .update({ name })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:domainId', (req, res) => {
  const { domainId } = req.params;

  if (!/^\d+$/.test(domainId)) {
    return res
      .status(400)
      .json({ error: 'domainId must be a positive integer' });
  }

  knex('domains')
    .where('id', domainId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'domain not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
