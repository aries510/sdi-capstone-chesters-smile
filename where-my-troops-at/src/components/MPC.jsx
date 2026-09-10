import { useState } from 'react';
import '../styles/MPC.css';
import Navbar from './Navbar';

const initialMissions = [
  {
    id: 1,
    name: 'Range Support',
    dates: '03 - 10 SEP 2026',
    location: 'Fort Bragg, NC',
    oic: 'CPT Cowardlylion',
    status: 'In Planning',
    stage: 3,
    readiness: 78,
    issue: '2 Personnel Gaps',
  },
  {
    id: 2,
    name: 'Field Exercise',
    dates: '05 - 07 SEP 2026',
    location: 'Training Area',
    oic: 'MAJ Tinman',
    status: 'In Planning',
    stage: 4,
    readiness: 92,
    issue: '1 Qualification Issue',
  },
  {
    id: 3,
    name: 'Convoy Operations',
    dates: '08 SEP 2026',
    location: 'Fort Bragg, NC',
    oic: 'CPT Scarecrow',
    status: 'Ready',
    stage: 5,
    readiness: 100,
    issue: null,
  },
];

const stages = [
  'Mission',
  'Plan / CONOP',
  'Personnel',
  'Readiness',
  'Approval',
];

const personnel = [
  {
    id: 1,
    name: 'CPT Aragorn',
    role: 'OIC',
    qualified: true,
    available: true,
  },
  {
    id: 2,
    name: 'SGT Legolas',
    role: 'Team Leader',
    qualified: true,
    available: true,
  },
  {
    id: 3,
    name: 'SPC Gandalf',
    role: 'Medic',
    qualified: false,
    available: true,
  },
];

function MPC() {
  const [missions, setMissions] = useState(initialMissions);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [assignedPersonnel, setAssignedPersonnel] = useState([]);
  const [viewStage, setViewStage] = useState(null);
  const [newMission, setNewMission] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    location: '',
    oic: '',
    purpose: '',
    requiredPersonnel: '',
    requiredRoles: '',
  });

  const [conop, setConop] = useState({
    situation: '',
    missionStatement: '',
    execution: '',
    sustainment: '',
    commandSignal: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNewMission({
      ...newMission,
      [name]: value,
    });
  }

  function handleConopChange(event) {
    const { name, value } = event.target;

    setConop({
      ...conop,
      [name]: value,
    });
  }

  function handlePersonnelToggle(personId) {
    if (assignedPersonnel.includes(personId)) {
      setAssignedPersonnel(assignedPersonnel.filter((id) => id !== personId));
    } else {
      setAssignedPersonnel([...assignedPersonnel, personId]);
    }
  }

  function handlePersonnelSubmit() {
    if (!selectedMission) {
      return;
    }

    const selectedPersonnel = personnel.filter((person) =>
      assignedPersonnel.includes(person.id),
    );

    const requiredPersonnel =
      selectedMission.requiredPersonnel || selectedPersonnel.length;

    const readiness = calculateReadiness(selectedPersonnel, requiredPersonnel);

    const personnelWithQualificationGaps = selectedPersonnel.filter(
      (person) => !person.qualified,
    );

    const qualificationGaps = personnelWithQualificationGaps.length;

    const availabilityConflicts = selectedPersonnel.filter(
      (person) => !person.available,
    ).length;

    const requiredRoles = selectedMission.requiredRoles
      ? selectedMission.requiredRoles
          .split(',')
          .map((role) => role.trim())
          .filter((role) => role)
      : [];

    const assignedRoles = selectedPersonnel.map((person) =>
      person.role.toLowerCase(),
    );

    const missingRoles = requiredRoles.filter(
      (role) => !assignedRoles.includes(role.toLowerCase()),
    );

    const personnelShortage = Math.max(
      requiredPersonnel - selectedPersonnel.length,
      0,
    );

    const issueParts = [];

    if (personnelShortage > 0) {
      issueParts.push(
        `${personnelShortage} Personnel Shortage${
          personnelShortage === 1 ? '' : 's'
        }`,
      );
    }

    if (qualificationGaps > 0) {
      issueParts.push(
        `${qualificationGaps} Qualification Gap${
          qualificationGaps === 1 ? '' : 's'
        }`,
      );
    }

    if (availabilityConflicts > 0) {
      issueParts.push(
        `${availabilityConflicts} Availability Conflict${
          availabilityConflicts === 1 ? '' : 's'
        }`,
      );
    }

    if (missingRoles.length > 0) {
      issueParts.push(
        `${missingRoles.length} Role Gap${
          missingRoles.length === 1 ? '' : 's'
        }`,
      );
    }

    const missionIssue = issueParts.length > 0 ? issueParts.join(' • ') : null;

    const updatedMissions = missions.map((mission) => {
      if (mission.id === selectedMission.id) {
        return {
          ...mission,
          personnel: selectedPersonnel,
          readiness: readiness,
          qualificationGaps: qualificationGaps,
          availabilityConflicts: availabilityConflicts,
          personnelShortage: personnelShortage,
          missingRoles: missingRoles,
          issue: missionIssue,
          personnelWithQualificationGaps: personnelWithQualificationGaps,
          stage: 4,
        };
      }

      return mission;
    });

    setMissions(updatedMissions);

    setSelectedMission({
      ...selectedMission,
      personnel: selectedPersonnel,
      readiness: readiness,
      qualificationGaps: qualificationGaps,
      availabilityConflicts: availabilityConflicts,
      personnelShortage: personnelShortage,
      missingRoles: missingRoles,
      issue: missionIssue,
      personnelWithQualificationGaps: personnelWithQualificationGaps,
      stage: 4,
    });

    setViewStage(4);
  }

  function calculateReadiness(assigned, requiredPersonnel) {
    if (assigned.length === 0) {
      return 0;
    }

    const readyPersonnel = assigned.filter(
      (person) => person.qualified && person.available,
    );

    const required = requiredPersonnel || assigned.length;

    return Math.min(Math.round((readyPersonnel.length / required) * 100), 100);
  }

  function handleReadinessSubmit() {
    if (!selectedMission) {
      return;
    }

    const updatedMissions = missions.map((mission) => {
      if (mission.id === selectedMission.id) {
        return {
          ...mission,
          stage: 5,
        };
      }

      return mission;
    });

    setMissions(updatedMissions);

    setSelectedMission({
      ...selectedMission,
      stage: 5,
    });

    setViewStage(5);
  }

  function handleApprovalSubmit() {
    if (!selectedMission) {
      return;
    }

    const updatedMissions = missions.map((mission) => {
      if (mission.id === selectedMission.id) {
        return {
          ...mission,
          status: 'Ready',
          issue: null,
          stage: 6,
        };
      }

      return mission;
    });

    setMissions(updatedMissions);

    setSelectedMission(null);
  }

  function handleConopSubmit(event) {
    event.preventDefault();

    if (!selectedMission) {
      return;
    }

    const updatedMissions = missions.map((mission) => {
      if (mission.id === selectedMission.id) {
        return {
          ...mission,
          conop: conop,
          stage: 3,
        };
      }

      return mission;
    });

    setMissions(updatedMissions);

    setSelectedMission({
      ...selectedMission,
      conop: conop,
      stage: 3,
    });
    setViewStage(3);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const missionToAdd = {
      id: Date.now(),
      name: newMission.name,
      type: newMission.type,
      dates: `${newMission.startDate} - ${newMission.endDate}`,
      location: newMission.location,
      oic: newMission.oic,
      purpose: newMission.purpose,
      requiredPersonnel: Number(newMission.requiredPersonnel),
      requiredRoles: newMission.requiredRoles,
      status: 'In Planning',
      stage: 2,
      readiness: 0,
      issue: null,
      personnel: [],
      conop: {
        situation: '',
        missionStatement: '',
        execution: '',
        sustainment: '',
        commandSignal: '',
      },
    };

    setMissions([...missions, missionToAdd]);

    setSelectedMission(missionToAdd);
    setViewStage(2);

    setNewMission({
      name: '',
      type: '',
      startDate: '',
      endDate: '',
      location: '',
      oic: '',
      purpose: '',
      requiredPersonnel: '',
      requiredRoles: '',
    });

    setShowMissionForm(false);
  }

  function handleMissionSelect(mission) {
    const currentMission = missions.find((item) => item.id === mission.id);

    if (!currentMission) {
      return;
    }

    setShowMissionForm(false);
    setSelectedMission(currentMission);
    setViewStage(currentMission.stage);

    setAssignedPersonnel(
      currentMission.personnel
        ? currentMission.personnel.map((person) => person.id)
        : [],
    );

    setConop(
      currentMission.conop || {
        situation: '',
        missionStatement: '',
        execution: '',
        sustainment: '',
        commandSignal: '',
      },
    );
  }

  return (
    <>
      <Navbar />
      <main className="mpc-page">
        <header className="mpc-header">
          <div>
            <h1>Planning</h1>
            <p>Manage mission planning and unit readiness</p>
          </div>

          <button type="button" onClick={() => setShowMissionForm(true)}>
            + New Mission Plan
          </button>
        </header>

        {selectedMission && viewStage === 2 && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>{selectedMission.name}</h2>
                <p>Step 2 of 5: Plan / CONOP</p>
              </div>

              <button type="button" onClick={() => setSelectedMission(null)}>
                Back
              </button>
            </div>

            <form onSubmit={handleConopSubmit}>
              <div className="form-group full-width">
                <label htmlFor="situation">Situation</label>
                <textarea
                  id="situation"
                  name="situation"
                  rows="3"
                  value={conop.situation}
                  onChange={handleConopChange}
                  required
                  placeholder="Describe the operational situation/environment..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="missionStatement">Mission Statement</label>
                <textarea
                  id="missionStatement"
                  name="missionStatement"
                  rows="3"
                  value={conop.missionStatement}
                  onChange={handleConopChange}
                  required
                  placeholder="5Ws: Who, what, where, when, and why..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="execution">Execution</label>
                <textarea
                  id="execution"
                  name="execution"
                  rows="4"
                  value={conop.execution}
                  onChange={handleConopChange}
                  required
                  placeholder="Provide details on how the mission will be accomplished, including the commander's intent, specific tasks, and coordinating instructions..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="sustainment">Sustainment</label>
                <textarea
                  id="sustainment"
                  name="sustainment"
                  rows="3"
                  value={conop.sustainment}
                  onChange={handleConopChange}
                  required
                  placeholder="Beans, bullets, band-aids..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="commandSignal">Command & Signal</label>
                <textarea
                  id="commandSignal"
                  name="commandSignal"
                  rows="3"
                  value={conop.commandSignal}
                  onChange={handleConopChange}
                  required
                  placeholder="Leadership/Chain of Command, communications, reporting..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setSelectedMission(null)}>
                  Back
                </button>

                <button type="submit">Save & Continue</button>
              </div>
            </form>
          </section>
        )}

        {selectedMission && viewStage === 3 && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>{selectedMission.name}</h2>
                <p>Step 3 of 5: Personnel</p>
              </div>

              <button type="button" onClick={() => setSelectedMission(null)}>
                Back
              </button>
            </div>

            <div className="personnel-list">
              {personnel.map((person) => (
                <div className="personnel-row" key={person.id}>
                  <div>
                    <strong>{person.name}</strong>
                    <p>{person.role}</p>
                  </div>

                  <div className="personnel-statuses">
                    <span
                      className={`personnel-status ${
                        person.qualified ? 'status-good' : 'status-bad'
                      }`}
                    >
                      {person.qualified ? 'Qualified' : 'Qualification Gap'}
                    </span>

                    <span
                      className={`personnel-status ${
                        person.available ? 'status-good' : 'status-bad'
                      }`}
                    >
                      {person.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <label className="personnel-select">
                    <input
                      type="checkbox"
                      checked={assignedPersonnel.includes(person.id)}
                      onChange={() => handlePersonnelToggle(person.id)}
                    />
                    <span>Assign</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setSelectedMission(null)}>
                Back
              </button>

              <button type="button" onClick={handlePersonnelSubmit}>
                Save & Continue
              </button>
            </div>
          </section>
        )}

        {selectedMission && viewStage === 4 && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>{selectedMission.name}</h2>
                <p>Step 4 of 5: Readiness</p>
              </div>

              <button type="button" onClick={() => setSelectedMission(null)}>
                Back
              </button>
            </div>

            <div className="readiness-overview">
              <div>
                <p className="readiness-label">Mission Readiness</p>

                <strong className="readiness-score">
                  {selectedMission.readiness}% Ready
                </strong>
              </div>

              <div
                className={`readiness-status ${
                  selectedMission.issue ? 'not-ready' : 'ready'
                }`}
              >
                {selectedMission.issue
                  ? 'Not Ready for Approval'
                  : 'Ready for Approval'}
              </div>
            </div>

            <div className="readiness-progress">
              <div
                className="readiness-progress-fill"
                style={{
                  width: `${selectedMission.readiness}%`,
                }}
              />
            </div>

            <h3 className="readiness-section-title">Requires Attention</h3>

            <div className="attention-grid">
              {selectedMission.personnelShortage > 0 && (
                <div className="attention-card">
                  <h3>Personnel Shortage</h3>
                  <strong>{selectedMission.personnelShortage}</strong>
                  <p>Unfilled Positions</p>
                </div>
              )}

              {selectedMission.missingRoles?.length > 0 && (
                <div className="attention-card">
                  <h3>Missing Roles</h3>
                  <strong>{selectedMission.missingRoles.length}</strong>
                  <p>{selectedMission.missingRoles.join(', ')}</p>
                </div>
              )}

              {selectedMission.qualificationGaps > 0 && (
                <div className="attention-card">
                  <h3>Qualification Gaps</h3>
                  <strong>{selectedMission.qualificationGaps}</strong>
                  <p>
                    {selectedMission.personnelWithQualificationGaps
                      ?.map((person) => person.name)
                      .join(', ')}
                  </p>
                </div>
              )}

              {selectedMission.availabilityConflicts > 0 && (
                <div className="attention-card">
                  <h3>Availability Conflicts</h3>
                  <strong>{selectedMission.availabilityConflicts}</strong>
                  <p>Personnel Unavailable</p>
                </div>
              )}
            </div>

            <h3 className="readiness-section-title">Readiness Details</h3>

            <div className="ready-checks">
              <div className="ready-check-row">
                <span>Personnel Assigned</span>
                <strong>
                  {selectedMission.personnel?.length || 0} of{' '}
                  {selectedMission.requiredPersonnel || 0}
                </strong>
              </div>

              <div className="ready-check-row">
                <span>Qualification Gaps</span>
                <strong>
                  {selectedMission.qualificationGaps > 0
                    ? selectedMission.qualificationGaps
                    : 'None'}
                </strong>
              </div>

              <div className="ready-check-row">
                <span>Availability Conflicts</span>
                <strong>
                  {selectedMission.availabilityConflicts > 0
                    ? selectedMission.availabilityConflicts
                    : 'None'}
                </strong>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setViewStage(3)}>
                Back to Personnel
              </button>

              <button
                type="button"
                onClick={handleReadinessSubmit}
                disabled={selectedMission.issue !== null}
              >
                Continue to Approval
              </button>
            </div>
          </section>
        )}

        {selectedMission && viewStage === 5 && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>{selectedMission.name}</h2>
                <p>Step 5 of 5: Approval</p>
              </div>

              <button type="button" onClick={() => setSelectedMission(null)}>
                Back
              </button>
            </div>

            <div className="readiness-summary">
              <h3>Mission Readiness</h3>
              <strong>{selectedMission.readiness}% Ready</strong>
            </div>

            <p>Mission plan is ready for review and approval</p>

            <div className="form-actions">
              <button type="button" onClick={() => setViewStage(4)}>
                Back to Readiness
              </button>

              <button type="button" onClick={handleApprovalSubmit}>
                Approve Mission
              </button>
            </div>
          </section>
        )}

        {selectedMission && viewStage === 6 && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>{selectedMission.name}</h2>
                <p>Approved Mission</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMission(null);
                  setViewStage(null);
                }}
              >
                Back
              </button>
            </div>

            <div className="readiness-summary">
              <h3>Mission Readiness</h3>
              <strong>{selectedMission.readiness}% Ready</strong>
            </div>

            <div className="ready-checks">
              <div className="ready-check-row">
                <span>Status</span>
                <strong>{selectedMission.status}</strong>
              </div>

              <div className="ready-check-row">
                <span>Dates</span>
                <strong>{selectedMission.dates}</strong>
              </div>

              <div className="ready-check-row">
                <span>Location</span>
                <strong>{selectedMission.location}</strong>
              </div>

              <div className="ready-check-row">
                <span>OIC</span>
                <strong>{selectedMission.oic}</strong>
              </div>

              <div className="ready-check-row">
                <span>Personnel Assigned</span>
                <strong>{selectedMission.personnel?.length || 0}</strong>
              </div>
            </div>
          </section>
        )}

        {showMissionForm && (
          <section className="new-mission-form">
            <div className="new-mission-header">
              <div>
                <h2>New Mission Plan</h2>
                <p>Step 1 of 5: Mission</p>
              </div>

              <button type="button" onClick={() => setShowMissionForm(false)}>
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="missionName">Mission Name</label>
                  <input
                    id="missionName"
                    name="name"
                    type="text"
                    placeholder="Range Support"
                    value={newMission.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="missionType">Mission Type</label>
                  <input
                    id="missionType"
                    name="type"
                    type="text"
                    placeholder="Training Support"
                    value={newMission.type}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newMission.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newMission.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Fort Bragg, NC"
                    value={newMission.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="oic">OIC</label>
                  <input
                    id="oic"
                    name="oic"
                    type="text"
                    placeholder="CPT Smith"
                    value={newMission.oic}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="purpose">Purpose / Description</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows="4"
                  placeholder="Describe the mission purpose..."
                  value={newMission.purpose}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requiredPersonnel">Required Personnel</label>

                <input
                  id="requiredPersonnel"
                  name="requiredPersonnel"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={newMission.requiredPersonnel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requiredRoles">Required Roles</label>

                <input
                  id="requiredRoles"
                  name="requiredRoles"
                  type="text"
                  placeholder="OIC, Team Leader, Medic"
                  value={newMission.requiredRoles}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowMissionForm(false)}>
                  Cancel
                </button>

                <button type="submit">Save & Continue</button>
              </div>
            </form>
          </section>
        )}
        <section className="summary-grid">
          <div className="summary-card">
            <h3>Active Missions</h3>
            <span>{missions.length}</span>
            <p>Mission Plans</p>
          </div>

          <div className="summary-card">
            <h3>Needs Attention</h3>
            <span>{missions.filter((mission) => mission.issue).length}</span>
            <p>Items</p>
          </div>

          <div className="summary-card">
            <h3>Upcoming Missions</h3>
            <span>
              {missions.filter((mission) => mission.status !== 'Ready').length}
            </span>
            <p>Upcoming</p>
          </div>
        </section>

        <section className="mission-section">
          <h2>Active Mission Plans</h2>

          <div className="mission-list">
            {missions.map((mission) => (
              <article className="mission-card" key={mission.id}>
                <div>
                  <h3>{mission.name}</h3>
                  <p>{mission.dates}</p>
                  <p>{mission.location}</p>
                  <p>OIC: {mission.oic}</p>
                </div>

                {/* Progress Tracker */}

                <div className="mission-progress">
                  {stages.map((stage, index) => {
                    const step = index + 1;
                    const completed = step < mission.stage;
                    const current = step === mission.stage;

                    return (
                      <div className="progress-wrapper" key={stage}>
                        <div className="progress-step">
                          <div
                            className={`progress-circle ${
                              completed ? 'completed' : current ? 'current' : ''
                            }`}
                          >
                            {completed ? '✓' : step}
                          </div>

                          <span className={current ? 'current-label' : ''}>
                            {stage}
                          </span>
                        </div>

                        {index < stages.length - 1 && (
                          <div
                            className={`progress-line ${
                              step < mission.stage ? 'completed' : ''
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Readiness */}
                <div>
                  <p>Status: {mission.status}</p>

                  {mission.readiness !== null && (
                    <strong>{mission.readiness}% Ready</strong>
                  )}

                  {mission.issue && (
                    <p className="mission-issue">{mission.issue}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleMissionSelect(mission)}
                >
                  {mission.status === 'Ready'
                    ? 'View Mission'
                    : 'Continue Planning'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default MPC;
