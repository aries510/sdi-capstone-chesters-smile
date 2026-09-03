const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('crew_qualifications').del();

  // Look up ids by natural key so seeds don't depend on auto-increment values
  const personnel = await knex('personnel').select('id');
  const crewRoles = await knex('crew_roles').select('id');
  const weaponSystems = await knex('weapon_systems').select('id');

  const qualifications = [];
  const seen = new Set();

  for (const person of personnel) {
    // Each crew member is qualified on 1-4 role/system combinations
    const count = faker.number.int({ min: 1, max: 4 });

    for (let i = 0; i < count; i += 1) {
      const roleId = faker.helpers.arrayElement(crewRoles).id;
      const systemId = faker.helpers.arrayElement(weaponSystems).id;
      const key = `${person.id}-${roleId}-${systemId}`;

      if (seen.has(key)) continue;
      seen.add(key);

      qualifications.push({
        personnel_id: person.id,
        crew_role_id: roleId,
        system_id: systemId,
        qualified_date: faker.date.past({ years: 5 }),
      });
    }
  }

  await knex('crew_qualifications').insert(qualifications);
};
