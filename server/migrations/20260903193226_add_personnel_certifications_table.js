/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('personnel_certifications', (table) => {
    table.increments('id').primary();
    table.integer('personnel_id').notNullable().references('personnel.id');
    table.integer('certifications_id').notNullable().references('certifications.id');
    table.date('date_earned').notNullable();
    table.date('expiry_date');
    table.unique(['personnel_id', 'certifications_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('personnel_certifications');
};
