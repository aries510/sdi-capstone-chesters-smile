/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('msn_personnel').del();

  const missions = await knex('msn_plans').select('id').orderBy('id');
  const people = await knex('personnel').select('id').orderBy('id').limit(6);

  await knex('msn_personnel').insert([
    { personnel_id: people[0].id, msn_id: missions[0].id },
    { personnel_id: people[1].id, msn_id: missions[0].id },
    { personnel_id: people[1].id, msn_id: missions[1].id },
    { personnel_id: people[2].id, msn_id: missions[1].id },
    { personnel_id: people[3].id, msn_id: missions[1].id },
    { personnel_id: people[4].id, msn_id: missions[2].id },
    { personnel_id: people[5].id, msn_id: missions[2].id },
  ]);
};
