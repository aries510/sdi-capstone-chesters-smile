const { faker } = require('@faker-js/faker');

const ranks = ['Spc1', 'Spc2', 'Spc3', 'Spc4', 'Sgt', 'TSgt', 'MSgt'];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('personnel').del();
  const members = Array.from({ length: 100 }, () => ({
    rank: faker.helpers.arrayElement(ranks),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
  }));

  await knex('personnel').insert(members);
};
