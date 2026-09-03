/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries (cascades to weapon_systems)
  await knex('domains').del();
  await knex('domains').insert([
    { name: 'Cyberspace' },
    { name: 'Space Domain Awareness' },
    { name: 'Orbital Warfare' },
    { name: 'Electromagnetic Warfare' },
  ]);
};
