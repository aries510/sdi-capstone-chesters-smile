import { useState, useEffect } from 'react';
import './AdminHome.css';
import EvaluatorsPanel from './EvaluatorsPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog';
import TraineeModal from './TraineeModal';
import Navbar from './Navbar';

const API_BASE = 'http://127.0.0.1:8080';

function AdminHome() {
    const [evaluators, setEvaluators] = useState([]);
    const [standardUsers, setStandardUsers] = useState([]);
    const [trainees, setTrainees] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [weaponSystems, setWeaponSystems] = useState([]);
    const [crewRoles, setCrewRoles] = useState([]);
    const [certifications, setCertifications] = useState([]);

    const [selectedDetails, setSelectedDetails] = useState(null); // Evaluators detail modal
    const [selectedTrainee, setSelectedTrainee] = useState(null); // Trainee qualification modal

    const fetchQuals = () => {
        fetch(`${API_BASE}/quals`)
            .then((res) => res.json())
            .then(setQualifications)
            .catch(console.error);
    };

    useEffect(() => {
        fetch(`${API_BASE}/users`)
            .then((res) => res.json())
            .then((users) => {
                setEvaluators(users.filter((u) => u.is_evaluator));
                setStandardUsers(users.filter((u) => !u.is_evaluator));
            })
            .catch(console.error);

        fetch(`${API_BASE}/personnel`)
            .then((res) => res.json())
            .then(setTrainees)
            .catch(console.error);

        fetchQuals();

        fetch(`${API_BASE}/weaponsystems`)
            .then((res) => res.json())
            .then(setWeaponSystems)
            .catch(console.error);

        fetch(`${API_BASE}/crewroles`)
            .then((res) => res.json())
            .then(setCrewRoles)
            .catch(console.error);

        fetch(`${API_BASE}/certs`)
            .then((res) => res.json())
            .then(setCertifications)
            .catch(console.error);
    }, []);

    const handleDeleteTrainee = async (id, e) => {
        e.stopPropagation();
        if (
            !window.confirm(
                'Are you sure you want to remove this trainee from the unit?',
            )
        )
            return;

        try {
            const res = await fetch(`${API_BASE}/personnel/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete trainee');

            setTrainees((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <div className="top-row">
                    <div className="eval-trainee-list">
                        <h3>Evaluators and Trainees</h3>
                        <p className="eval-trainee-subtitle">
                            Click name to view details
                        </p>

                        <div className="eval-trainee-scroll">
                            <div className="personnel-group">
                                <h4 className="group-title title-evaluator">
                                    Evaluators
                                </h4>
                                {evaluators.length === 0 ? (
                                    <p className="no-records-msg">
                                        No evaluators found.
                                    </p>
                                ) : (
                                    <ul className="personnel-list">
                                        {evaluators.map((ev) => (
                                            <li
                                                key={ev.id}
                                                className="personnel-item"
                                                onClick={() =>
                                                    setSelectedDetails({
                                                        type: 'Evaluator Account',
                                                        ...ev,
                                                    })
                                                }
                                            >
                                                <span>{ev.username}</span>
                                                <span className="badge badge-evaluator">
                                                    Evaluator
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="personnel-group">
                                <h4 className="group-title title-trainee">
                                    Trainees
                                </h4>
                                {trainees.length === 0 ? (
                                    <p className="no-records-msg">
                                        No trainees found.
                                    </p>
                                ) : (
                                    <ul className="personnel-list">
                                        {trainees.map((t) => (
                                            <li
                                                key={t.id}
                                                className="personnel-item"
                                                onClick={() => setSelectedTrainee(t)}
                                            >
                                                <span>
                                                    {t.rank} {t.first_name} {t.last_name}
                                                </span>
                                                <div className="trainee-item-actions">
                                                    <span className="badge badge-trainee">
                                                        Trainee
                                                    </span>
                                                    <button
                                                        className="btn-delete-trainee"
                                                        onClick={(e) => handleDeleteTrainee(t.id, e)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="admin-actions">
                        <div className="upload-button">UPLOAD DOCUMENT</div>
                        <div className="import-button">+ BULK IMPORT PDF/CSV</div>
                    </div>
                </div>

                <div className="admin-panels">
                    <EvaluatorsPanel
                        evaluators={evaluators}
                        standardUsers={standardUsers}
                        trainees={trainees}
                        onEvaluatorAdded={(newEvaluator) => {
                            const user = Array.isArray(newEvaluator)
                                ? newEvaluator[0]
                                : newEvaluator.user || newEvaluator;
                            setEvaluators((prev) => [...prev, user]);
                        }}
                        onEvaluatorUpdated={(updatedData) => {
                            const user = Array.isArray(updatedData)
                                ? updatedData[0]
                                : updatedData.user || updatedData;
                            if (!user || !user.id) return;

                            const isEvaluator = Boolean(user.is_evaluator);

                            if (isEvaluator) {
                                setEvaluators((prev) => {
                                    const exists = prev.some(
                                        (e) => Number(e.id) === Number(user.id),
                                    );
                                    return exists
                                        ? prev.map((e) =>
                                            Number(e.id) === Number(user.id) ? user : e,
                                        )
                                        : [...prev, user];
                                });
                                setStandardUsers((prev) =>
                                    prev.filter((u) => Number(u.id) !== Number(user.id)),
                                );
                            } else {
                                setEvaluators((prev) =>
                                    prev.filter((e) => Number(e.id) !== Number(user.id)),
                                );
                                setStandardUsers((prev) => {
                                    const exists = prev.some(
                                        (u) => Number(u.id) === Number(user.id),
                                    );
                                    return exists
                                        ? prev.map((u) =>
                                            Number(u.id) === Number(user.id) ? user : u,
                                        )
                                        : [...prev, user];
                                });
                            }
                        }}
                        onEvaluatorDeleted={(id) => {
                            setEvaluators((prev) =>
                                prev.filter((e) => Number(e.id) !== Number(id)),
                            );
                        }}
                    />
                    <CertQualRenewalPanel />
                </div>

                <div className="catalog-wrapper">
                    <CertificationCatalog />
                </div>

                {/* Trainee Modal for qualifications/training */}
                {selectedTrainee && (
                    <TraineeModal
                        trainee={selectedTrainee}
                        weaponSystems={weaponSystems}
                        crewRoles={crewRoles}
                        certifications={certifications}
                        onClose={() => setSelectedTrainee(null)}
                        onQualAdded={fetchQuals}
                    />
                )}

                {/* Evaluator generic details modal */}
                {selectedDetails && (
                    <div className="modal-overlay blur-bg">
                        <div className="details-modal">
                            <div className="details-modal-header">
                                <h3>{selectedDetails.type} Details</h3>
                                <button
                                    className="close-icon-btn"
                                    onClick={() => setSelectedDetails(null)}
                                >
                                    &times;
                                </button>
                            </div>

                            <ul className="details-list">
                                {Object.entries(selectedDetails)
                                    .filter(([key]) => key !== 'type' && key !== 'pw_hash')
                                    .map(([key, value]) => (
                                        <li key={key} className="details-item">
                                            <strong className="details-label">
                                                {key.replace(/_/g, ' ')}:
                                            </strong>
                                            <span className="details-value">
                                                {typeof value === 'boolean'
                                                    ? value
                                                        ? 'True'
                                                        : 'False'
                                                    : String(value ?? 'N/A')}
                                            </span>
                                        </li>
                                    ))}
                            </ul>

                            <div className="details-modal-actions">
                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedDetails(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminHome;