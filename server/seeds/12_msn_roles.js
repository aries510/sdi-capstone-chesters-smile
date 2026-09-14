/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('msn_roles').del();

  const missions = await knex('msn_plans')
    .select('id', 'msn_name', 'num_personnel_req')
    .orderBy('id');
  const roles = await knex('crew_roles').select('id', 'name');
  const roleId = (name) => roles.find((role) => role.name === name).id;

  const roleCountsByMission = {
    'blue thunder': {
      'Basic Host Analyst': 2,
      'Senior Host Analyst': 1,
      'Cyber Crew Commander': 1,
    },
    'deep water': {
      'Basic Network Analyst': 2,
      'Senior Network Analyst': 1,
      'Basic Host Analyst': 1,
      'Cyber Crew Commander': 1,
    },
    'ghost air': {
      'Basic Host Analyst': 2,
      'Basic Network Analyst': 2,
      'Senior Host Analyst': 1,
      'Cyber Crew Commander': 1,
    },
  };

  const rows = missions.flatMap((mission) => {
    const roleCounts = roleCountsByMission[mission.msn_name] ?? {};
    return Object.entries(roleCounts).flatMap(([roleName, count]) =>
      Array.from({ length: count }, () => ({
        msn_id: mission.id,
        crew_role_id: roleId(roleName),
      })),
    );
  });

  await knex('msn_roles').insert(rows);
};
