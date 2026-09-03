# Problem Statement

- Current personnel tracking is fragmented across disconnected spreadsheets and PowerPoint presentations. This leaves commanders without a centralized method to evaluate unit readiness in real time, leading to ineffective management of unit personnel.

- Where My Troops At?™ aims to centralize personnel tracking by providing commanders with a single platform to manage and monitor unit personnel information in real time. This will improve visibility into unit readiness, reduce reliance on disconnected spreadsheets and presentations, and enable more effective personnel management and informed decision-making.

## ERD

```mermaid
erDiagram
  personnel ||--o{ crew_qualifications : holds
  crew_roles ||--o{ crew_qualifications : qualifies_for
  weapon_systems ||--o{ crew_qualifications : on_system
  domain ||--o{ weapon_systems : categorizes
  personnel ||--o{ personnel_certifications : earns
  certifications ||--o{ personnel_certifications : held_by
  crew_roles ||--o{ crew_role_certifications : requires
  certifications ||--o{ crew_role_certifications : required_by

  users {
    int id PK
    string username
    string pw_hash
    boolean is_admin
    boolean is_evaluator
    boolean is_planner
  }
  personnel {
    int id PK
    string rank
    string lname
    string fname
  }
  crew_roles {
    int id PK
    string name
    string description
  }
  weapon_systems {
    int id PK
    string name
    string description
    int id_domain FK
  }
  domain {
    int id PK
    string name
  }
  crew_qualifications {
    int id PK
    int id_personnel FK
    int id_crew_roles FK
    int id_weapon_systems FK
    date qualified_date
    string status
  }
  certifications {
    int id PK
    string name
  }
  personnel_certifications {
    int id PK
    int id_personnel FK
    int id_certifications FK
    date date_earned
    date expiry_date
  }
  crew_role_certifications {
    int id PK
    int id_crew_roles FK
    int id_certifications FK
  }
```
---

## <summary> Resources </summary>
<details>

### [Calendar.js]('https://calendarjs.com/docs')


</details>
