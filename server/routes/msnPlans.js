const express = require('express')
const router = express.Router();
const knex = require('knex')(require('../knexfile.js')['development']);

router.use(express.json());

router.get('/', (request, response) => {
    knex('msn_plans')
        .select('*')
        .then(users => response.json(users))
});

router.post('/', (req, res) => {
  const { msnName, msnType, startDate, endDate, locationName, personnelName, descriptionText } = req.body;
  const [memberRank, lastName] = personnelName.split(' ');

  if (!msnName || !msnType || !startDate || !endDate || !locationName || !personnelName || !descriptionText) {
    return res
      .status(400)
      .json({ error: 'Please input data required.' });
  }

  Promise.all([
    knex('personnel')
        .select('id')
        .where({rank: memberRank, last_name: lastName})
        .first()
  ])
    .then((member) => {
      if (!member) {
        return res
          .status(404)
          .json({ error: 'Member not found' });
      }

      return knex('msn_plans')
        .insert({ msn_name: msnName, msn_type: msnType, start_date: startDate, end_date: endDate, location: locationName, personnel_id: member, description: descriptionText })
        .then(() => res.status(201).json({ message: 'Successfully created' }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});