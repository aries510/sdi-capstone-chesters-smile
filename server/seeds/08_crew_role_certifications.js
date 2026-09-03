const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('crew_role_certifications').del();

  // Look up ids by natural key so seeds don't depend on auto-increment values
  const crewRoles = await knex('crew_roles').select('id');
  const certifications = await knex('certifications').select('id');

  const crewRoleCertifications = [];
  const seen = new Set();

  for (const role of crewRoles) {
    const count = faker.number.int({ min: 1, max: 2 });

    for (let i = 0; i < count; i += 1) {
      const certId = faker.helpers.arrayElement(certifications).id;
      const key = `${role.id}-${certId}`;

      if (seen.has(key)) continue;
      seen.add(key);

      crewRoleCertifications.push({
        crew_role_id: role.id,
        certifications_id: certId,
      });
    }
  }

  await knex('crew_role_certifications').insert(crewRoleCertifications);
};
