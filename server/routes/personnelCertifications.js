const express = require('express');
const app = express();
const knex = require('knex')(require('../knexfile.js')['development']);
const router = express.Router();

app.use(express.json());

router.get('/', (req, res) => {
  const { member } = req.query;

  const query = knex('personnel_certifications')
    .select('personnel.rank')
    .select(
      knex.raw("personnel.first_name || ' ' || personnel.last_name as member"),
    )
    .select(
      knex.raw(`json_agg(json_build_object(
        'certification', certifications.name,
        'date_earned', personnel_certifications.date_earned,
        'expiry_date', personnel_certifications.expiry_date
      )) as certifications`),
    )
    .join(
      'personnel',
      'personnel_certifications.personnel_id',
      '=',
      'personnel.id',
    )
    .join(
      'certifications',
      'personnel_certifications.certifications_id',
      '=',
      'certifications.id',
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

  knex('personnel_certifications')
    .select('personnel.rank')
    .select(
      knex.raw("personnel.first_name || ' ' || personnel.last_name as member"),
    )
    .select(
      knex.raw(`json_agg(json_build_object(
        'certification', certifications.name,
        'date_earned', personnel_certifications.date_earned,
        'expiry_date', personnel_certifications.expiry_date
      )) as certifications`),
    )
    .where('personnel.id', '=', personId)
    .join(
      'personnel',
      'personnel_certifications.personnel_id',
      '=',
      'personnel.id',
    )
    .join(
      'certifications',
      'personnel_certifications.certifications_id',
      '=',
      'certifications.id',
    )
    .groupBy('personnel.id')
    .then((data) =>
      res
        .status(200)
        .json(data[0] || { rank: null, member: null, certifications: [] }),
    )
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const { member, cert, date_earned, expiry_date } = req.body;

  if (!member || !cert || !date_earned || !expiry_date) {
    return res.status(400).json({ error: 'missing required data' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .whereRaw("first_name || ' ' || last_name ilike ?", [member])
      .first(),
    knex('certifications').select('id').where('name', 'ilike', cert).first(),
  ])
    .then(([person, certification]) => {
      if (!person || !certification) {
        return res
          .status(404)
          .json({ error: 'member or certification not found' });
      }

      return knex('personnel_certifications')
        .insert({
          personnel_id: person.id,
          certifications_id: certification.id,
          date_earned,
          expiry_date,
        })
        .then(() => res.status(201).json({ message: 'Successfully created' }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.patch('/:personId/:certId', (req, res) => {
  const { personId, certId } = req.params;
  const { date_earned, expiry_date } = req.body;

  if (!/^\d+$/.test(personId) || !/^\d+$/.test(certId)) {
    return res
      .status(400)
      .json({ error: 'personId and certId must be positive integers' });
  }

  if (!date_earned && !expiry_date) {
    return res
      .status(400)
      .json({ error: 'date_earned or expiry_date is required' });
  }

  const updates = {};
  if (date_earned) updates.date_earned = date_earned;
  if (expiry_date) updates.expiry_date = expiry_date;

  knex('personnel_certifications')
    .where('personnel_id', personId)
    .andWhere('certifications_id', certId)
    .update(updates)
    .then((updatedCount) => {
      if (!updatedCount) {
        return res
          .status(404)
          .json({ error: 'personnel certification not found' });
      }

      res.status(200).json({ message: 'Successfully updated' });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:personId/:certId', (req, res) => {
  const { personId, certId } = req.params;
  if (!/^\d+$/.test(personId) || !/^\d+$/.test(certId)) {
    return res
      .status(400)
      .json({ error: 'personId and certId must be positive integers' });
  }
  knex('personnel_certifications')
    .where('personnel_id', personId)
    .andWhere('certifications_id', certId)
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
  const { member, cert } = req.query;

  if (!member || !cert) {
    return res
      .status(400)
      .json({ error: 'member and cert query parameters are required' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .whereRaw("first_name || ' ' || last_name ilike ?", [member])
      .first(),
    knex('certifications').select('id').where('name', 'ilike', cert).first(),
  ])
    .then(([person, certification]) => {
      if (!person || !certification) {
        return res
          .status(404)
          .json({ error: 'member or certification not found' });
      }

      return knex('personnel_certifications')
        .where('personnel_id', person.id)
        .andWhere('certifications_id', certification.id)
        .del()
        .then((deletedCount) => {
          if (!deletedCount) {
            return res
              .status(404)
              .json({ error: 'personnel certification not found' });
          }
          res.status(204).end();
        });
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = router;
