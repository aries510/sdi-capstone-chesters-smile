/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('crew_roles').del();
  await knex('crew_roles').insert([
    {
      name: 'Basic Host Analyst',
      description:
        "Monitors individual host endpoints (workstations, servers) for anomalous activity under supervision. Reviews host-based logs and alerts, escalates suspected incidents, and performs initial triage. Learns the crew's toolset, standard operating procedures, and reporting formats. Not yet certified to act independently on a live system.",
    },
    {
      name: 'Senior Host Analyst',
      description:
        'Independently investigates host-level threats, performs endpoint forensics, and validates alerts flagged by basic analysts. Correlates host telemetry with known indicators of compromise, documents findings, and recommends containment actions. Serves as an initial trainer for basic host analysts on the crew.',
    },
    {
      name: 'Master Host Analyst',
      description:
        'Owns the host-defense mission area for the crew. Develops detection logic and hunt hypotheses, leads complex endpoint investigations, and sets host-analysis standards and procedures. Supervises and certifies host analysts, and advises the crew commander on host-side risk and readiness.',
    },
    {
      name: 'Basic Network Analyst',
      description:
        "Monitors network traffic and perimeter sensors for anomalous or malicious activity under supervision. Reviews flow data, IDS/IPS alerts, and packet captures, performs initial triage, and escalates suspected intrusions. Builds proficiency with the crew's network toolset and procedures.",
    },
    {
      name: 'Senior Network Analyst',
      description:
        'Independently analyzes network intrusions, traces adversary movement across the network, and validates alerts from basic analysts. Correlates network indicators with host findings, recommends blocks and mitigations, and documents the intrusion timeline. Trains basic network analysts.',
    },
    {
      name: 'Master Network Analyst',
      description:
        'Owns the network-defense mission area for the crew. Designs network detection and hunt strategies, leads major intrusion investigations, and defines network-analysis standards. Supervises and certifies network analysts, and advises the crew commander on network-side threats and posture.',
    },
    {
      name: 'Cyber Crew Commander',
      description:
        "Leads and is accountable for the full cyber crew during operations. Directs host and network analysts, prioritizes response actions, manages the crew's mission readiness, and serves as the decision authority for containment and escalation. Owns crew certification status, mission reporting, and coordination with higher command.",
    },
  ]);
};
