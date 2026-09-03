const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('personnel_certifications').del();

  // Look up ids by natural key so seeds don't depend on auto-increment values
  const personnel = await knex('personnel').select('id');
  const certifications = await knex('certifications').select('id');

  const personnelCertifications = [];
  const seen = new Set();

  for (const person of personnel) {
    // Each crew member has earned 1-2 certifications
    const count = faker.number.int({ min: 1, max: 2 });

    for (let i = 0; i < count; i += 1) {
      const certId = faker.helpers.arrayElement(certifications).id;
      const key = `${person.id}-${certId}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const dateEarned = faker.date.past({ years: 5 });
      // Certifications are valid for 3 years from the date earned
      const expiryDate = new Date(dateEarned);
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);

      personnelCertifications.push({
        personnel_id: person.id,
        certifications_id: certId,
        date_earned: dateEarned,
        expiry_date: expiryDate,
      });
    }
  }

  await knex('personnel_certifications').insert(personnelCertifications);
};
