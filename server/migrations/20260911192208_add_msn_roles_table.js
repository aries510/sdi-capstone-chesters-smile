/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('msn_roles', (table) => {
    table.increments('id');
    table
      .integer('msn_id')
      .references('msn_plans.id')
      .notNullable()
      .onDelete('CASCADE');
    table
      .integer('crew_role_id')
      .references('crew_roles.id')
      .notNullable()
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('msn_roles');
};
