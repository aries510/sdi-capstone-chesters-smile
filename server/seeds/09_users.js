const bcrypt = require('bcrypt');

const saltRounds = 10;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Dev-only default password for every seeded account.
  const pw_hash = await bcrypt.hash('password', saltRounds);

  await knex('users').insert([
    {
      username: 'admin',
      pw_hash: pw_hash,
      is_admin: true,
      is_evaluator: true,
      is_planner: true,
    },
    {
      username: 'evaluator',
      pw_hash: pw_hash,
      is_evaluator: true,
    },
    {
      username: 'msn_planner',
      pw_hash: pw_hash,
      is_planner: true,
    },
    {
      username: 'gen_user',
      pw_hash: pw_hash,
    },
  ]);
  const evaluators = await knex('personnel')
    .select('id', 'first_name', 'last_name')
    .where('role', 'evaluator')
    .limit(2);
  const trainees = await knex('personnel')
    .select('id', 'first_name', 'last_name')
    .where('role', 'trainee')
    .limit(2);
  const testPersonnel = await knex('personnel')
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

  const toUsername = (p) =>
    `${p.first_name}.${p.last_name}`.toLowerCase().replace(/[^a-z.]/g, '');

  await knex('users').insert([
    ...evaluators.map((p) => ({
      username: toUsername(p),
      pw_hash: pw_hash,
      is_evaluator: true,
      personnel_id: p.id,
    })),
    ...trainees.map((p) => ({
      username: toUsername(p),
      pw_hash: pw_hash,
      personnel_id: p.id,
    })),
    {
      username: 'test_user',
      pw_hash: pw_hash,
      personnel_id: testPersonnel?.id ?? null,
    },
    {
      username: 'test_evauluator',
      pw_hash: pw_hash,
      is_evaluator: true,
      personnel_id: testEvaluator?.id ?? null,
    },
    {
      username: 'test_planner',
      pw_hash: pw_hash,
      is_planner: true,
      personnel_id: testPlanner?.id ?? null,
    },
  ]);
};
