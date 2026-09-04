# General User




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

## Not Yet Discussed, Worth Considering
- **Unit/assignment context** — which unit or squadron this person currently belongs to; relevant if the app ever needs to filter "show me everyone in my unit," and not covered by current tables
- **Contact info** — how MPC actually reaches someone once assigned; not in `personnel` currently
- **Qualification currency trend over time** — not urgent, but a "history" view (quals gained/lost/renewed over time) could be a nice differentiator in the final presentation vs. the spreadsheet it's replacing

## Feature ideas for other roles (context, not building these)
- **Evaluator**: same core data as GeneralUser, plus editing rights over their assigned trainees' quals/certs; bulk import; search/filter across personnel
- **Admin**: manage evaluator/trainee assignments; certification catalog CRUD; bulk import/upload documents
- **MPC**: this is the actual consumer of everything above — mission creation, personnel-gap view (who's needed vs. who's assigned), readiness dashboard aggregating every GeneralUser's status
