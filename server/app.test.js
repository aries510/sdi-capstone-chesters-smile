const mockTables = {
  personnel: [
    {
      id: 1,
      rank: 'Capt',
      first_name: 'John',
      last_name: 'Doe',
      role: 'trainee',
    },
    {
      id: 2,
      rank: 'TSgt',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'evaluator',
    },
  ],
  users: [
    { id: 1, username: 'jdoe', personnel_id: 1, is_admin: false },
    { id: 2, username: 'jsmith', personnel_id: 2, is_admin: true },
  ],
  domains: [
    { id: 1, name: 'Air' },
    { id: 2, name: 'Space' },
  ],
  weapon_systems: [
    {
      id: 1,
      name: 'F-16',
      acronym: 'F16',
      description: 'Fighter jet',
      domain: 'Air',
    },
  ],
  crew_roles: [
    { id: 1, name: 'Pilot' },
    { id: 2, name: 'Navigator' },
  ],
  certifications: [
    { id: 1, name: 'Basic Cert' },
    { id: 2, name: 'Advanced Cert' },
  ],
  crew_qualifications: [
    {
      personId: 1,
      rank: 'Capt',
      member: 'John Doe',
      qualifications: [
        {
          roleId: 1,
          role: 'Pilot',
          systemId: 1,
          system: 'F-16',
          qualified_date: '2025-01-01',
          is_current: true,
        },
      ],
    },
  ],
  personnel_certifications: [
    {
      personId: 1,
      rank: 'Capt',
      member: 'John Doe',
      certifications: [
        {
          certId: 1,
          certification: 'Basic Cert',
          date_earned: '2024-01-01',
          expiry_date: '2026-01-01',
          is_current: true,
        },
      ],
    },
  ],
  crew_role_certifications: [
    {
      roleId: 1,
      crew_role: 'Pilot',
      certifications: [{ certId: 1, certification: 'Basic Cert' }],
    },
  ],
  msn_plans: [
    {
      id: 1,
      msn_name: 'Exercise Alpha',
      msn_type: 'Training',
      start_date: '2026-01-01',
      end_date: '2026-01-05',
      location: 'Base X',
      num_personnel_req: 5,
      personnel: [],
      crew_roles: [],
    },
  ],
};

jest.mock('knex', () => {
  const actualKnexFactory = jest.requireActual('knex');
  const mockKnexLib = require('mock-knex');

  return jest.fn((config) => {
    const instance = actualKnexFactory(config);
    mockKnexLib.mock(instance);
    return instance;
  });
});

const request = require('supertest');
const { getTracker } = require('mock-knex');
const app = require('./app');

const tracker = getTracker();

beforeEach(() => {
  tracker.install();
});

afterEach(() => {
  tracker.uninstall();
});

function respond(data) {
  tracker.on('query', (query) => query.response(data));
}

describe('GET /', () => {
  test('returns the API homepage text', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(418);
    expect(res.text).toBe('Chester Smiles API Homepage....');
  });
});

describe('GET /brew', () => {
  test('returns a teapot error', async () => {
    const res = await request(app).get('/brew');
    expect(res.status).toBe(418);
    expect(res.body.error).toBe("I'm a teapot");
  });
});

describe('GET /personnel', () => {
  test('returns the personnel list', async () => {
    respond(mockTables.personnel);
    const res = await request(app).get('/personnel');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.personnel);
  });

  test('GET /personnel/:id returns a single record', async () => {
    respond([mockTables.personnel[0]]);
    const res = await request(app).get('/personnel/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.personnel[0]);
  });

  test('GET /personnel/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/personnel/abc');
    expect(res.status).toBe(400);
  });

  test('GET /personnel/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/personnel/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /users', () => {
  test('returns the users list', async () => {
    respond(mockTables.users);
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.users);
  });

  test('GET /users/:id returns a single record', async () => {
    respond([mockTables.users[0]]);
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.users[0]);
  });

  test('GET /users/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/users/abc');
    expect(res.status).toBe(400);
  });

  test('GET /users/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/users/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /domains', () => {
  test('returns the domains list', async () => {
    respond(mockTables.domains);
    const res = await request(app).get('/domains');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.domains);
  });

  test('GET /domains/:id returns a single record', async () => {
    respond([mockTables.domains[0]]);
    const res = await request(app).get('/domains/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.domains[0]);
  });

  test('GET /domains/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/domains/abc');
    expect(res.status).toBe(400);
  });

  test('GET /domains/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/domains/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /weaponsystems', () => {
  test('returns the weapon systems list', async () => {
    respond(mockTables.weapon_systems);
    const res = await request(app).get('/weaponsystems');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.weapon_systems);
  });

  test('GET /weaponsystems/:id returns a single record', async () => {
    respond([mockTables.weapon_systems[0]]);
    const res = await request(app).get('/weaponsystems/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.weapon_systems[0]);
  });

  test('GET /weaponsystems/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/weaponsystems/abc');
    expect(res.status).toBe(400);
  });

  test('GET /weaponsystems/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/weaponsystems/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /crewroles', () => {
  test('returns the crew roles list', async () => {
    respond(mockTables.crew_roles);
    const res = await request(app).get('/crewroles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.crew_roles);
  });

  test('GET /crewroles/:id returns a single record', async () => {
    respond([mockTables.crew_roles[0]]);
    const res = await request(app).get('/crewroles/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.crew_roles[0]);
  });

  test('GET /crewroles/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/crewroles/abc');
    expect(res.status).toBe(400);
  });

  test('GET /crewroles/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/crewroles/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /certs', () => {
  test('returns the certifications list', async () => {
    respond(mockTables.certifications);
    const res = await request(app).get('/certs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.certifications);
  });

  test('GET /certs/:id returns a single record', async () => {
    respond([mockTables.certifications[0]]);
    const res = await request(app).get('/certs/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.certifications[0]);
  });

  test('GET /certs/:id returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/certs/abc');
    expect(res.status).toBe(400);
  });

  test('GET /certs/:id returns 404 for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/certs/999');
    expect(res.status).toBe(404);
  });
});

describe('GET /msnplans', () => {
  test('returns the mission plans list', async () => {
    respond(mockTables.msn_plans);
    const res = await request(app).get('/msnplans');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.msn_plans);
  });
});

describe('GET /quals', () => {
  test('returns the qualifications list', async () => {
    respond(mockTables.crew_qualifications);
    const res = await request(app).get('/quals');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.crew_qualifications);
  });

  test("GET /quals/:personId returns that member's qualifications", async () => {
    respond([mockTables.crew_qualifications[0]]);
    const res = await request(app).get('/quals/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockTables.crew_qualifications[0]]);
  });

  test('GET /quals/:personId returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/quals/abc');
    expect(res.status).toBe(400);
  });

  test('GET /quals/:personId returns an empty array for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/quals/999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /perscerts', () => {
  test('returns the personnel certifications list', async () => {
    respond(mockTables.personnel_certifications);
    const res = await request(app).get('/perscerts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.personnel_certifications);
  });

  test("GET /perscerts/:personId returns that member's certifications", async () => {
    respond([mockTables.personnel_certifications[0]]);
    const res = await request(app).get('/perscerts/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.personnel_certifications[0]);
  });

  test('GET /perscerts/:personId returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/perscerts/abc');
    expect(res.status).toBe(400);
  });

  test('GET /perscerts/:personId returns a null placeholder for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/perscerts/999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      personId: null,
      rank: null,
      member: null,
      certifications: [],
    });
  });
});

describe('GET /crewcerts', () => {
  test('returns the crew role certifications list', async () => {
    respond(mockTables.crew_role_certifications);
    const res = await request(app).get('/crewcerts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.crew_role_certifications);
  });

  test("GET /crewcerts/:roleId returns that role's certifications", async () => {
    respond([mockTables.crew_role_certifications[0]]);
    const res = await request(app).get('/crewcerts/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTables.crew_role_certifications[0]);
  });

  test('GET /crewcerts/:roleId returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/crewcerts/abc');
    expect(res.status).toBe(400);
  });

  test('GET /crewcerts/:roleId returns a null placeholder for a nonexistent id', async () => {
    respond([]);
    const res = await request(app).get('/crewcerts/999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ crew_role: null, certifications: [] });
  });
});
