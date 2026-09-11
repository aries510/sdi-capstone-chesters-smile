/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('msn_personnel', (table) => {
    table.increments('id');
    table
      .integer('personnel_id')
      .notNullable()
      .references('personnel.id')
      .onDelete('CASCADE');
    table
      .integer('msn_id')
      .notNullable()
      .references('msn_plans.id')
      .onDelete('CASCADE');
    table.unique(['personnel_id', 'msn_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('msn_personnel');
};
