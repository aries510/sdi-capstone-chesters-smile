/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table.string('status').notNullable().defaultTo('In Planning');
    table.integer('stage').notNullable().defaultTo(1);
    table.integer('readiness').notNullable().defaultTo(0);
    table.string('issue');
    table.string('approved_by');
    table.timestamp('approved_at');
    table.text('situation');
    table.text('mission_statement');
    table.text('execution');
    table.text('sustainment');
    table.text('command_signal');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('msn_plans', (table) => {
    table.dropColumn('status');
    table.dropColumn('stage');
    table.dropColumn('readiness');
    table.dropColumn('issue');
    table.dropColumn('approved_by');
    table.dropColumn('approved_at');
    table.dropColumn('situation');
    table.dropColumn('mission_statement');
    table.dropColumn('execution');
    table.dropColumn('sustainment');
    table.dropColumn('command_signal');
  });
};
