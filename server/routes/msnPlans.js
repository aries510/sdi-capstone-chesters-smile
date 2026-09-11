const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile.js')['development']);

router.use(express.json());

router.get('/', (request, response) => {
  const { msnName, msnType, location, personnelName } = request.query;

  const query = knex('msn_plans')
    .leftJoin('msn_personnel', 'msn_plans.id', 'msn_personnel.msn_id')
    .leftJoin('personnel', 'msn_personnel.personnel_id', 'personnel.id')
    .groupBy('msn_plans.id')
    .select(
      'msn_plans.id',
      'msn_plans.msn_name',
      'msn_plans.msn_type',
      knex.raw("to_char(msn_plans.start_date, 'YYYY-MM-DD') AS start_date"),
      knex.raw("to_char(msn_plans.end_date, 'YYYY-MM-DD') AS end_date"),
      'msn_plans.location',
      'msn_plans.num_personnel_req',
      knex.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'personId', personnel.id,
              'name', CONCAT(personnel.rank, ' ', personnel.last_name, ', ', personnel.first_name)
            )
          ) FILTER (WHERE personnel.id IS NOT NULL),
          '[]'
        ) AS personnel
      `),
      knex.raw(`
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'roleId', role_counts.crew_role_id,
              'role', crew_roles.name,
              'required', role_counts.required
            ))
            FROM (
              SELECT crew_role_id, count(*) AS required
              FROM msn_roles
              WHERE msn_roles.msn_id = msn_plans.id
              GROUP BY crew_role_id
            ) role_counts
            JOIN crew_roles ON crew_roles.id = role_counts.crew_role_id
          ),
          '[]'
        ) AS roles
      `),
      'msn_plans.description',
      // 'msn_plans.status',
      // 'msn_plans.readiness',
      // 'msn_plans.stage',
      // 'msn_plans.issue',
      // 'msn_plans.required_personnel',
      // 'msn_plans.required_roles',
      // 'msn_plans.approved_by',
      // 'msn_plans.approved_at',
      // 'msn_plans.situation',
      // 'msn_plans.mission_statement',
      // 'msn_plans.execution',
      // 'msn_plans.sustainment',
      // 'msn_plans.command_signal',
    );

  if (msnName) {
    query.where('msn_plans.msn_name', 'ilike', msnName);
  }

  if (msnType) {
    query.where('msn_plans.msn_type', 'ilike', msnType);
  }

  if (location) {
    query.where('msn_plans.location', 'ilike', location);
  }

  if (personnelName) {
    query.whereExists(
      knex('msn_personnel')
        .join('personnel', 'msn_personnel.personnel_id', 'personnel.id')
        .whereRaw('msn_personnel.msn_id = msn_plans.id')
        .andWhereRaw("first_name || ' ' || last_name ilike ?", [personnelName]),
    );
  }

  query
    .then((plans) => response.json(plans))
    .catch((error) => response.status(500).json({ error: error.message }));
});

router.post('/', (req, res) => {
  const {
    msnName,
    msnType,
    startDate,
    endDate,
    locationName,
    descriptionText,
  } = req.body;

  if (
    !msnName ||
    !msnType ||
    !startDate ||
    !endDate ||
    !locationName ||
    !descriptionText
  ) {
    return res.status(400).json({ error: 'Please input data required.' });
  }

  knex('msn_plans')
    .insert({
      msn_name: msnName,
      msn_type: msnType,
      start_date: startDate,
      end_date: endDate,
      location: locationName,
      description: descriptionText,
    })
    .then(() => res.status(201).json({ message: 'Successfully created' }))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.delete('/:plansId', (request, response) => {
  const { plansId } = request.params;

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

router.patch('/:plansId', (request, response) => {
  const { plansId } = request.params;
  const { updates } = request.body;

  knex('msn_plans')
    .where({ id: plansId })
    .update(updates)
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

router.post('/:plansId/personnel', (request, response) => {
  const { plansId } = request.params;
  const { personnelId } = request.body;

  if (!personnelId) {
    return response.status(400).json({ error: 'personnelId is required.' });
  }

  knex('msn_personnel')
    .insert({ personnel_id: personnelId, msn_id: plansId })
    .then(() =>
      response.status(201).json({ message: 'Personnel assigned to mission.' }),
    )
    .catch((error) => {
      if (error.code === '23505') {
        return response
          .status(409)
          .json({ error: 'Personnel already assigned to this mission.' });
      }
      if (error.code === '23503') {
        return response
          .status(404)
          .json({ error: 'Personnel or mission plan not found.' });
      }
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Failed to assign personnel.' });
    });
});

router.delete('/:plansId/personnel', (request, response) => {
  const { plansId } = request.params;
  const { personnelId } = request.body;

  if (!personnelId) {
    return response.status(400).json({ error: 'personnelId is required.' });
  }

  knex('msn_personnel')
    .where({ personnel_id: personnelId, msn_id: plansId })
    .del()
    .then((deleted) => {
      if (deleted === 0) {
        return response
          .status(404)
          .json({ error: 'Personnel is not assigned to this mission.' });
      }
      response.json({ message: 'Personnel removed from mission.' });
    })
    .catch((error) => {
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Failed to remove personnel.' });
    });
});

router.post('/:plansId/roles', (request, response) => {
  const { plansId } = request.params;
  const { crewRoleId } = request.body;

  if (!crewRoleId) {
    return response.status(400).json({ error: 'crewRoleId is required.' });
  }

  knex('msn_plans')
    .select('num_personnel_req')
    .where({ id: plansId })
    .first()
    .then((mission) => {
      if (!mission) {
        return response.status(404).json({ error: 'Mission plan not found.' });
      }

      return knex('msn_roles')
        .where({ msn_id: plansId })
        .count('id as assigned')
        .first()
        .then(({ assigned }) => {
          if (Number(assigned) >= mission.num_personnel_req) {
            return response.status(400).json({
              error:
                'Mission already has the required number of roles assigned.',
            });
          }

          return knex('msn_roles')
            .insert({ msn_id: plansId, crew_role_id: crewRoleId })
            .then(() =>
              response.status(201).json({ message: 'Role added to mission.' }),
            );
        });
    })
    .catch((error) => {
      if (error.code === '23503') {
        return response.status(404).json({ error: 'Crew role not found.' });
      }
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Failed to add role.' });
    });
});

router.delete('/:plansId/roles', (request, response) => {
  const { plansId } = request.params;
  const { crewRoleId } = request.body;

  if (!crewRoleId) {
    return response.status(400).json({ error: 'crewRoleId is required.' });
  }

  knex('msn_roles')
    .whereIn('id', function () {
      this.select('id')
        .from('msn_roles')
        .where({ msn_id: plansId, crew_role_id: crewRoleId })
        .limit(1);
    })
    .del()
    .then((deleted) => {
      if (deleted === 0) {
        return response
          .status(404)
          .json({ error: 'Role is not assigned to this mission.' });
      }
      response.json({ message: 'Role removed from mission.' });
    })
    .catch((error) => {
      console.log('Error occurred:', error);
      response.status(500).json({ error: 'Failed to remove role.' });
    });
});

module.exports = router;
