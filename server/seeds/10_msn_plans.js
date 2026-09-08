const { faker } = require('@faker-js/faker');

const ranks = ['2Lt', '1Lt', 'Capt', 'Maj'];


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const members = Array.from({ length: 100 }, () => ({
      rank: faker.helpers.arrayElement(ranks),
      last_name: faker.person.lastName(),
    }));
  // Deletes ALL existing entries
  await knex('table_name').del()
  await knex('table_name').insert([
    {id: 1, msn_name: 'blue thunder', msn_type: 'training', start_date: '2023-01-01', end_date: '2023-01-10', location: 'range 1', personnel_id: 27, description: 'space effect fires iso centcom'},
    {id: 2, msn_name: 'deep water', msn_type: 'training', start_date: '2026-09-04', end_date: '2026-09-05', location: 'range 2', personnel_id: 46, description: 'red cyber effects iso southcom'},
    {id: 3, msn_name: 'ghost air', msn_type: 'training', start_date: '2027-02-10', end_date: '2027-02-15', location: 'range 3', personnel_id: 78, description: 'blue cyber effects iso korpen'},
  ]);
};
