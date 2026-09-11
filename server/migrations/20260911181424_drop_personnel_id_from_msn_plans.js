/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table.dropColumn('personnel_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table
      .integer('personnel_id')
      .notNullable()
      .references('personnel.id')
      .onDelete('CASCADE');
    table.unique(['personnel_id']);
  });
};
