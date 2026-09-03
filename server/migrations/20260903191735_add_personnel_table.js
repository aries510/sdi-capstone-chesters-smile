/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('personnel', (table) => {
    table.increments('id');
    table.string('rank').notNullable();
    table.string('last_name').notNullable();
    table.string('first_name').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('personnel');
};
