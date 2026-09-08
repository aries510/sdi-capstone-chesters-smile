const express = require('express')
const router = express.Router();
const knex = require('knex')(require('../knexfile.js')['development']);

router.use(express.json());

router.get('/', (request, response) => {
    knex('msn_plans')
        .join('personnel', 'msn_plans.personnel_id', '=', 'personnel.id')
        .select(
            'msn_plans.id',
            'msn_plans.msn_name',
            'msn_plans.msn_type',
            'msn_plans.start_date',
            'msn_plans.end_date',
            'msn_plans.location',
            knex.raw("CONCAT(personnel.rank, ' ', personnel.last_name, ', ', personnel.first_name) AS personnel"),
            'msn_plans.description'
        )
        .then(plans => response.json(plans))
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