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
};
