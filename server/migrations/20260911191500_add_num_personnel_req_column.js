/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table.integer('num_personnel_req');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table.dropColumn('num_personnel_req');
  });
};
