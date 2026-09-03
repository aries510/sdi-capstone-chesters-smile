/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('weapon_systems').del();

  // Look up domain ids by name so seeds don't depend on auto-increment values
  const domains = await knex('domains').select('id', 'name');
  const domainId = Object.fromEntries(domains.map((d) => [d.name, d.id]));

  const weaponSystems = [
    {
      name: 'Cyberspace Defense Analysis',
      acronym: 'CDA',
      description:
        'Provides operational effects designed to protect and defend critical Air Force data at the nexus of adversarial threats, Air Force priorities and key missions, and user behavior on Air Force networks.',
      domain: 'Cyberspace',
    },
    {
      name: 'Air Force Cyberspace Defense',
      acronym: 'ACD',
      description:
        'Weapon system is designed to prevent, detect, respond to, and provide forensics of intrusions into unclassified and classified networks.',
      domain: 'Cyberspace',
    },
    {
      name: 'Cyber Command and Control Mission System',
      acronym: 'C3MS',
      description:
        'Provides operational level command and control (C2) and situational awareness of Air Force cyberspace forces, networks and mission systems.',
      domain: 'Cyberspace',
    },
    {
      name: 'Cyber Security and Control System',
      acronym: 'CSCS',
      description:
        'Monitors, assesses and responds to real-time network events and identify and characterize anomalous activity.',
      domain: 'Cyberspace',
    },
    {
      name: 'Air Force Intranet Control',
      acronym: 'AFINC',
      description:
        'Serves as the top-level boundary and entry point into the Air Force Information Network, and controls the flow of external and interbase traffic through managed gateways',
      domain: 'Cyberspace',
    },
    {
      name: 'Cyberspace Vulnerability Assessment/Hunter',
      acronym: 'CVA/H',
      description:
        "Performs threat assessment and compliance within the Air Force's command network.",
      domain: 'Cyberspace',
    },
    {
      name: 'Manticore',
      acronym: null,
      description:
        'An out-of-band defensive cyberspace software suite used by the U.S. Space Force (USSF) under the Defensive Cyber Operations for Space (DCO-S) program.',
      domain: 'Cyberspace',
    },
    {
      name: 'Kraken',
      acronym: null,
      description:
        'An in-band defensive cyberspace operations software suite that provides active "Protect and Respond" capabilities for legacy and future space mission systems.',
      domain: 'Cyberspace',
    },
  ];

  await knex('weapon_systems').insert(
    weaponSystems.map(({ domain, ...rest }) => ({
      ...rest,
      domain_id: domainId[domain],
    })),
  );
};
