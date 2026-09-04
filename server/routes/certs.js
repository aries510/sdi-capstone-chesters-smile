const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { name } = req.query;
  const query = knex('certifications').select('*');

  if (name) {
    query.where('name', 'ilike', name);
  }
  query
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/:certId', (req, res) => {
  const { certId } = req.params;

  if (!/^\d+$/.test(certId)) {
    return res.status(400).json({ error: 'certId must be a positive integer' });
  }

  knex('certifications')
    .select('*')
    .where('id', certId)
    .first()
    .then((cert) => {
      if (!cert) {
        return res.status(404).json({ error: 'certification not found' });
      }
      res.status(200).json(cert);
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  knex('certifications')
    .select('id')
    .where('name', 'ilike', name)
    .first()
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ error: 'certification already exists' });
      }

      return knex('certifications')
        .insert({ name })
        .returning('*')
        .then(([certs]) => res.status(201).json(certs));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:certId', (req, res) => {
  const { certId } = req.params;
  const { name } = req.body;

  if (!/^\d+$/.test(certId)) {
    return res.status(400).json({ error: 'certId must be a positive integer' });
  }

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  knex('certifications')
    .select('id')
    .where('id', certId)
    .first()
    .then((cert) => {
      if (!cert) {
        return res.status(404).json({ error: 'certification not found' });
      }

      return knex('certifications')
        .where('id', certId)
        .update({ name })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/', (req, res) => {
  const { name } = req.query;
  const { name: newName } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  if (!newName) {
    return res.status(400).json({ error: 'name is required' });
  }

  knex('certifications')
    .select('id')
    .where('name', 'ilike', name)
    .first()
    .then((cert) => {
      if (!cert) {
        return res.status(404).json({ error: 'certification not found' });
      }

      return knex('certifications')
        .where('id', cert.id)
        .update({ name: newName })
        .returning('*')
        .then(([updated]) => res.status(200).json(updated));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  knex('certifications')
    .select('id')
    .where('name', 'ilike', name)
    .first()
    .then((cert) => {
      if (!cert) {
        return res.status(404).json({ error: 'certification not found' });
      }

      return knex('certifications')
        .where('id', cert.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res.status(404).json({ error: 'certification not found' });
          }
          res.status(204).end();
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:certId', (req, res) => {
  const { certId } = req.params;

  if (!/^\d+$/.test(certId)) {
    return res.status(400).json({ error: 'certId must be a positive integer' });
  }

  knex('certifications')
    .where('id', certId)
    .del()
    .then((deletedCount) => {
      if (!deletedCount) {
        return res.status(404).json({ error: 'certification not found' });
      }
      res.status(204).end();
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
