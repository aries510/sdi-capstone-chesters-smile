const express = require('express');
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
      knex.raw("to_char(msn_plans.start_date, 'YYYY-MM-DD') AS start_date"),
      knex.raw("to_char(msn_plans.end_date, 'YYYY-MM-DD') AS end_date"),
      'msn_plans.location',
      knex.raw(
        "CONCAT(personnel.rank, ' ', personnel.last_name, ', ', personnel.first_name) AS personnel",
      ),
      'msn_plans.description',
      'msn_plans.status',
      'msn_plans.readiness',
      'msn_plans.stage',
      'msn_plans.issue',
      'msn_plans.required_personnel',
      'msn_plans.required_roles',
      'msn_plans.approved_by',
      'msn_plans.approved_at',
      'msn_plans.situation',
      'msn_plans.mission_statement',
      'msn_plans.execution',
      'msn_plans.sustainment',
      'msn_plans.command_signal',
    )
    .then((plans) => response.json(plans));
});

router.post('/', (req, res) => {
  const {
    msnName,
    msnType,
    startDate,
    endDate,
    locationName,
    personnelName,
    descriptionText,
  } = req.body;
  const [memberRank, lastName] = personnelName.split(' ');

  if (
    !msnName ||
    !msnType ||
    !startDate ||
    !endDate ||
    !locationName ||
    !personnelName ||
    !descriptionText
  ) {
    return res.status(400).json({ error: 'Please input data required.' });
  }

  Promise.all([
    knex('personnel')
      .select('id')
      .where({ rank: memberRank, last_name: lastName })
      .first(),
  ])
    .then((member) => {
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      return knex('msn_plans')
        .insert({
          msn_name: msnName,
          msn_type: msnType,
          start_date: startDate,
          end_date: endDate,
          location: locationName,
          personnel_id: member.id,
          description: descriptionText,
        })
        .then(() => res.status(201).json({ message: 'Successfully created' }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:id', (request, response) => {
  const plansId = request.params.id;

  knex('msn_plans')
    .where({ id: plansId })
    .del()
    .then((deleted) => {
      if (deleted === 0) {
        return response.status(404).json({ error: 'Misson plan not found.' });
      }
      response.json({ message: 'Mission plan deleted.' });
    })
    .catch((error) => {
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Delete request failed.' });
    });
});

router.patch('/:id', (request, response) => {
  const plansId = request.params.id;
  const { personnel, updates } = request.body;
  const [personnelRank, lastName] = personnel.split(' ');

  knex('personnel')
    .where({ rank: personnelRank, last_name: lastName })
    .first()
    .then(([member]) => {
      if (!member) {
        return response.status(404).json({ error: 'Personnel not found' });
      }
      return knex('msn_plans')
        .where({ personnel_id: member.id })
        .update(updates);
    })
    .then((updated) => {
      if (updated === 0) {
        return response.status(404).json({ error: 'Mission plan not found' });
      }
      response.status(200).json({ message: 'Mission plan updated' });
    })
    .catch((error) => {
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Update failed' });
    });
});

module.exports = router;
