# General User

## Status (as of 2026-09-14)

### Done
- Identity (rank/name) wired to `/personnel/:id`, with demo fallback
- Qualifications wired to `/quals/:id`, with demo fallback
- Certifications wired to `/perscerts/:id`, with demo fallback
- Weapon Systems row derived from quals (`getDistinctSystems`) — multi-role-per-system handled with AND logic (every role tied to a system must be current, not just one)
- FMC/PMC/Expired status system in place across Weapon Systems, Crew Roles, and Certifications rows (PMC intentionally placeholder `0` — no backing data yet, see In Progress)
- Overall FMC/NMC readiness badge, derived from the above
- Current Missions panel, built against shaped mock data (real `msn_plans` table can't support multiple/past missions yet)
- Mission "Not Ready" logic (`meetsRequirements`) comparing a mission's required certs against held, current certs
- Mission detail modal (its own codeblock, not the generic modal)
- Generic modal (`modalContent`/`getModalContent`) covering Weapon Systems and Certifications
- Next Steps panel, derived from expired certs (`certTasks`)
- Crew role certification requirements fetch (`roleCerts`, via `/crewcerts/:roleId`, one fetch per distinct role using `Promise.all`)
- Navbar integrated (branding, nav links, light/dark toggle) — own local toggle removed as redundant
- Full theming pass to match Admin/Evaluator/MPC's shared variables and MPC's status-tag pattern (`--status-good/warn/bad`, light+dark variants)

### In Progress
- **Crew Certifications modal** — renaming/reworking "Crew Roles" (currently still using the generic `modalContent` path) into its own dedicated codeblock: left side lists roles, selecting one shows that role's required certs on the right, color-coded. Needs: `selectedRole` state (built), the generic-modal cleanup so `'quals'` no longer needs handling there, then the actual two-pane modal JSX + its own styling.
- **Real personnel_id wiring** — `personnelId` is still hardcoded to `1`. Backend now supports pulling real user/personnel data with logins tied to a key with the user id (confirmed 9/9) — next step is reading that real id from the login response instead of the hardcoded value, which still depends on an AuthContext (or similar) existing to carry it app-wide.
- **Dark/light persistence across pages** — flagged, not yet solved. Navbar's toggle works on GeneralUser itself, but navigating to another page loses the state (no wrapper/shared context carrying it yet).


## Purpose
GeneralUser is where the underlying data actually gets populated and kept current — quals, certs, availability. MPC (mission planners) depend on this data being accurate and current to build plans, assign the right operators to the right missions, and manage timelines across multiple concurrent missions. Framing for every feature below: does this help MPC make a better assignment decision, or help the individual keep their own record accurate?

## Core Features (buildable now, current schema)
- **Identity**: rank, first/last name | `personnel`
- **Qualifications list**: crew role + weapon system + status + qualified date | `crew_qualifications`
- **Certifications list**: name + date earned + expiry date | `personnel_certifications`
- **Weapon system & domain breakdown**: group quals by domain (e.g. "qualified on 2 of 3 systems in Cyber domain") | `weapon_systems` + `domain`
- **Renewal/expiration alerts**: flag certs expiring soon or already lapsed | `personnel_certifications.expiry_date` vs. today
- **Cert gap analysis**: what a crew role *requires* vs. what this person *has* — shows missing certs directly | `crew_role_certifications` vs. `personnel_certifications`

## Features Needing New Schema (raised as debrief questions — see capstoneDebriefItems above)
- **Missions involved in** (current) + **view records** button (past missions) | needs new `missions` + `mission_assignments` tables
- **Evaluator/Trainer ID**: who trained/signed off on this qualification | needs a trainer/evaluator FK, doesn't exist on `crew_qualifications` yet
- **Personal scoping** ("my" quals/certs/missions instead of an all-users list) | needs `personnel_id` FK on `users`

## Optional / Additional (not core, valuable if time allows)
- **Availability / readiness status**: a single derived flag ("ready" / "not current") combining valid certs + no scheduling conflict — this is likely the single most useful thing to hand MPC, since it turns raw data into an actual assignment decision instead of something they compute by hand
- **Blackout dates / unavailability window** (leave, TDY, other commitments) — MPC can't assign someone who's about to be gone; nothing in the schema tracks this today
- **Timeline/calendar view of current commitments** — helps MPC spot double-booking across multiple missions at a glance, not just a flat list
- **Notification-style feed** ("cert expiring, renew now", "assigned to mission X", "selected for role X, missing N certs") — explicitly deferred, logged as a future idea
- **Export "my record" as PDF** — useful for boards/evaluations outside the app entirely, low priority
- **Self-service training request** — let a general user flag "I want to pursue qual X," surfacing demand to Evaluators/MPC rather than requiring a memory sync

## Finishing-touch idea (not building yet)
- **Ambient color/lighting feedback**, tied to status rather than just badges/text: a red vignette on sign-in failure or missing records; on the general page, green = ready, blue = in-training/in-process, yellow = new or missing/expired certs; red specifically for "assigned despite missing certs" — signals a real mistake was made, not just a routine gap. A later polish pass, once core functionality/data is in place.

## Not Yet Discussed, Worth Considering
- **Unit/assignment context** — which unit or squadron this person currently belongs to; relevant if the app ever needs to filter "show me everyone in my unit," and not covered by current tables
- **Contact info** — how MPC actually reaches someone once assigned; not in `personnel` currently
- **Qualification currency trend over time** — not urgent, but a "history" view (quals gained/lost/renewed over time) could be a nice differentiator in the final presentation vs. the spreadsheet it's replacing

## Terminology note (not yet applied)
- Recommended: use real maintenance-readiness codes instead of generic labels for the status badges — **PMC / FMC / NMC** (Partially / Fully / Not Mission Capable) instead of "In-Progress / Ready / Not Started." More domain-authentic. Swap once the status columns are finalized.

## Feature ideas for other roles (context, not building these)
- **Evaluator**: same core data as GeneralUser, plus editing rights over their assigned trainees' quals/certs; bulk import; search/filter across personnel
- **Admin**: manage evaluator/trainee assignments; certification catalog CRUD; bulk import/upload documents
- **MPC**: this is the actual consumer of everything above — mission creation, personnel-gap view (who's needed vs. who's assigned), readiness dashboard aggregating every GeneralUser's status
