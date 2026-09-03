/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('crew_role_certifications', (table) => {
    table.increments('id').primary();
    table.integer('crew_role_id').notNullable().references('crew_roles.id');
    table.integer('certifications_id').notNullable().references('certifications.id');
    table.unique(['crew_role_id', 'certifications_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('crew_role_certifications');
};
