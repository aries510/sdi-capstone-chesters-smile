/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('certifications').del();
  await knex('certifications').insert([
    { name: 'CompTIA Security+' },
    { name: 'CISSP' },
    { name: 'GCFA' },
  ]);
};
