/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('msn_plans', table => {
    table.increments('id');
    table.string('msn_name').notNullable();
    table.string('msn_type').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.string('location').notNullable();
    table
      .integer('personnel_id')
      .notNullable()
      .references('personnel.id')
      .onDelete('CASCADE');
    table.string('description').notNullable();
    table.unique(['personnel_id']);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('msn_plans');
};
