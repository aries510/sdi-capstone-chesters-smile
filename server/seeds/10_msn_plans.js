/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('msn_plans').del();

  // Grab real personnel ids so the FK constraint is satisfied regardless of
  // where the personnel id sequence currently sits.
  const people = await knex('personnel').select('id').orderBy('id').limit(3);

  await knex('msn_plans').insert([
    {
      msn_name: 'blue thunder',
      msn_type: 'training',
      start_date: '2023-01-01',
      end_date: '2023-01-10',
      location: 'range 1',
      personnel_id: people[0].id,
      description: 'space effect fires iso centcom',
    },
    {
      msn_name: 'deep water',
      msn_type: 'training',
      start_date: '2026-09-04',
      end_date: '2026-09-05',
      location: 'range 2',
      personnel_id: people[1].id,
      description: 'red cyber effects iso southcom',
    },
    {
      msn_name: 'ghost air',
      msn_type: 'training',
      start_date: '2027-02-10',
      end_date: '2027-02-15',
      location: 'range 3',
      personnel_id: people[2].id,
      description: 'blue cyber effects iso korpen',
    },
  ]);
};
