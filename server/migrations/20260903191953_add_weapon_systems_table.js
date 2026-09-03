/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('weapon_systems', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('acronym');
    table.string('description');
    table
      .integer('domain_id')
      .notNullable()
      .references('domains.id')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('weapon_systems');
};
