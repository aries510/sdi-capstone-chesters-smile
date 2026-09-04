import { useState } from "react";
import "./MPC.css";

const missions = [
    {
        id: 1,
        name: "Range Support",
        dates: "03 - 10 SEP 2026",
        location: "Fort Bragg, NC",
        oic: "CPT Cowardlylion",
        status: "In Planning",
        stage: 3,
        readiness: 78,
        issue: "2 Personnel Gaps",
    },
    {
        id: 2,
        name: "Field Exercise",
        dates: "05 - 07 SEP 2026",
        location: "Training Area",
        oic: "MAJ Tinman",
        status: "In Planning",
        stage: 4,
        readiness: 92,
        issue: "1 Qualification Issue",
    },
    {
        id: 3,
        name: "Convoy Operations",
        dates: "08 SEP 2026",
        location: "Fort Bragg, NC",
        oic: "CPT Scarecrow",
        status: "Ready",
        stage: 5,
        readiness: 100,
        issue: null,
    },
];

const stages = [
    "Mission",
    "Plan / CONOP",
    "Personnel",
    "Readiness",
    "Publish",
];

function MPC() {
    const [showMissionForm, setShowMissionForm] = useState(false);

    return (
        <main className="mpc-page">
            <header className="mpc-header">
                <div>
                    <h1>Planning</h1>
                    <p>Manage mission planning and unit readiness</p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowMissionForm(true)}
                >
                    + New Mission Plan
                </button>
            </header>

            {showMissionForm && (
                <section className="new-mission-form">
                    <div className="new-mission-header">
                        <div>
                            <h2>New Mission Plan</h2>
                            <p>Step 1 of 5: Mission</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowMissionForm(false)}
                        >
                            Cancel
                        </button>
                    </div>

                    <form>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="missionName">Mission Name</label>
                                <input
                                    id="missionName"
                                    type="text"
                                    placeholder="Range Support"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="missionType">Mission Type</label>
                                <input
                                    id="missionType"
                                    type="text"
                                    placeholder="Training Support"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input id="startDate" type="date" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">End Date</label>
                                <input id="endDate" type="date" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    id="location"
                                    type="text"
                                    placeholder="Fort Bragg, NC"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="oic">OIC</label>
                                <input
                                    id="oic"
                                    type="text"
                                    placeholder="CPT Smith"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="purpose">Purpose / Description</label>
                            <textarea
                                id="purpose"
                                rows="4"
                                placeholder="Describe the mission purpose..."
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setShowMissionForm(false)}
                            >
                                Cancel
                            </button>

                            <button type="submit">
                                Save & Continue
                            </button>
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
                    <span>3</span>
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
                                                    className={`progress-circle ${completed ? "completed" : current ? "current" : ""
                                                        }`}
                                                >
                                                    {completed ? "✓" : step}
                                                </div>

                                                <span className={current ? "current-label" : ""}>
                                                    {stage}
                                                </span>
                                            </div>

                                            {index < stages.length - 1 && (
                                                <div
                                                    className={`progress-line ${step < mission.stage ? "completed" : ""
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

                            <button type="button">
                                {mission.status === "Ready"
                                    ? "View Mission"
                                    : "Continue Planning"}
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default MPC;