const { faker } = require('@faker-js/faker');

const ranks = ['Spc1', 'Spc2', 'Spc3', 'Spc4', 'Sgt', 'TSgt', 'MSgt'];
const roles = ['trainee', 'evaluator', 'planner'];

const maxEvaluators = 10;
const maxPlanners = 10;
const evaluatorCount = 0;

const testUsers = [
  {
    rank: 'TSgt',
    first_name: 'Test',
    last_name: 'GeneralUser',
    role: 'trainee',
  },
  {
    rank: 'MSgt',
    first_name: 'Test',
    last_name: 'Evaluator',
    role: 'evaluator',
  },
  {
    rank: 'MSgt',
    first_name: 'Test',
    last_name: 'Planner',
    role: 'planner',
  },
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('personnel').del();

  const maxEvaluators = 10;
  const members = Array.from({ length: 100 }, (_, i) => ({
    rank: faker.helpers.arrayElement(ranks),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role:
      i < maxEvaluators
        ? 'evaluator'
        : i < maxEvaluators + maxPlanners
          ? 'planner'
          : 'trainee',
  }));

  await knex('personnel').insert(faker.helpers.shuffle(members));

  await knex('personnel').insert(testUsers);
};
