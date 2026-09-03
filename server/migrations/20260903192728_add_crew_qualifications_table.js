/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('crew_qualifications', (table) => {
    table.increments('id').primary();
    table.integer('personnel_id').notNullable().references('personnel.id');
    table.integer('crew_role_id').notNullable().references('crew_roles.id');
    table.integer('system_id').notNullable().references('weapon_systems.id');
    table.date('qualified_date').notNullable();
    table.unique(['personnel_id', 'crew_role_id', 'system_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('crew_qualifications');
};
