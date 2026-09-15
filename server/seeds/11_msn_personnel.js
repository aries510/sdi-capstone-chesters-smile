/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('msn_personnel').del();

  const missions = await knex('msn_plans').select('id').orderBy('id');
  //For demonstration
  const testGeneralUser = await knex('personnel')
    .select('id')
    .where({ first_name: 'Test', last_name: 'GeneralUser' })
    .first();
  const testEvaluator = await knex('personnel')
    .select('id')
    .where({ first_name: 'Test', last_name: 'Evaluator' })
    .first();
  const testPlanner = await knex('personnel')
    .select('id')
    .where({ first_name: 'Test', last_name: 'Planner' })
    .first();
  const people = await knex('personnel').select('id').orderBy('id').limit(6);

  await knex('msn_personnel').insert([
    { personnel_id: people[0].id, msn_id: missions[0].id },
    { personnel_id: people[1].id, msn_id: missions[0].id },
    { personnel_id: people[1].id, msn_id: missions[1].id },
    { personnel_id: people[2].id, msn_id: missions[1].id },
    { personnel_id: people[3].id, msn_id: missions[1].id },
    { personnel_id: people[4].id, msn_id: missions[2].id },
    { personnel_id: people[5].id, msn_id: missions[2].id },
    { personnel_id: testGeneralUser.id, msn_id: missions[0].id },
    { personnel_id: testGeneralUser.id, msn_id: missions[2].id },
    { personnel_id: testPlanner.id, msn_id: missions[0].id },
    { personnel_id: testEvaluator.id, msn_id: missions[0].id },
  ]);
};
