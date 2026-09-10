import { useState, useEffect } from 'react';
import './AdminHome.css';
import EvaluatorsPanel from './EvaluatorsPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog';
import TraineeModal from './TraineeModal';
import logo from './bg-images/spaceforcelogo.png';
import Navbar from './Navbar';

function AdminHome() {
    const [evaluators, setEvaluators] = useState([]);
    const [standardUsers, setStandardUsers] = useState([]);
    const [trainees, setTrainees] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [weaponSystems, setWeaponSystems] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    const [selectedDetails, setSelectedDetails] = useState(null); // Evaluators detail modal
    const [selectedTrainee, setSelectedTrainee] = useState(null); // Trainee qualification modal

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-theme', !darkMode);
    };

    const fetchQuals = () => {
        fetch('http://127.0.0.1:8080/quals')
            .then((res) => res.json())
            .then(setQualifications)
            .catch(console.error);
    };

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/users`)
            .then((res) => res.json())
            .then((users) => {
                setEvaluators(users.filter((u) => u.is_evaluator));
                setStandardUsers(users.filter((u) => !u.is_evaluator));
            })
            .catch(console.error);

        fetch('http://127.0.0.1:8080/personnel')
            .then((res) => res.json())
            .then(setTrainees)
            .catch(console.error);

        fetchQuals();

        fetch('http://127.0.0.1:8080/weaponsystems')
            .then((res) => res.json())
            .then(setWeaponSystems)
            .catch(console.error);
    }, []);

    const getQualsForTrainee = (personnelId) =>
        qualifications.filter((q) => q.personnel_id === personnelId);

    const getSystemName = (systemId) => {
        const sys = weaponSystems.find((s) => s.id === systemId);
        return sys ? sys.name : `System #${systemId}`;
    };

    const handleDeleteTrainee = async (id, e) => {
        e.stopPropagation();
        if (
            !window.confirm(
                'Are you sure you want to remove this trainee from the unit?',
            )
        )
            return;

        try {
            const res = await fetch(`http://127.0.0.1:8080/personnel/${id}`, {
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
                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: '#6b7280',
                                margin: '0 0 10px 0',
                            }}
                        >
                            Click name to view details
                        </p>

                        <div
                            style={{
                                maxHeight: '250px',
                                overflowY: 'auto',
                                paddingRight: '8px',
                            }}
                        >
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0.5rem 0', color: '#2563eb' }}>
                                    Evaluators
                                </h4>
                                {evaluators.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        No evaluators found.
                                    </p>
                                ) : (
                                    <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                                        {evaluators.map((ev) => (
                                            <li
                                                key={ev.id}
                                                onClick={() =>
                                                    setSelectedDetails({
                                                        type: 'Evaluator Account',
                                                        ...ev,
                                                    })
                                                }
                                                style={{
                                                    padding: '6px 8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    'rgba(0,0,0,0.05)')
                                                }
                                                onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    'transparent')
                                                }
                                            >
                                                <span>{ev.username}</span>
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                    }}
                                                >
                                                    Evaluator
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h4 style={{ margin: '0.5rem 0', color: '#059669' }}>
                                    Trainees
                                </h4>
                                {trainees.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        No trainees found.
                                    </p>
                                ) : (
                                    <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                                        {trainees.map((t) => (
                                            <li
                                                key={t.id}
                                                onClick={() => setSelectedTrainee(t)}
                                                style={{
                                                    padding: '6px 8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    'rgba(0,0,0,0.05)')
                                                }
                                                onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    'transparent')
                                                }
                                            >
                                                <span>
                                                    {t.rank} {t.first_name} {t.last_name}
                                                </span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            backgroundColor: '#d1fae5',
                                                            color: '#065f46',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                        }}
                                                    >
                                                        Trainee
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteTrainee(t.id, e)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#dc2626',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                        }}
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
                        quals={getQualsForTrainee(selectedTrainee.id)}
                        weaponSystems={weaponSystems}
                        getSystemName={getSystemName}
                        onClose={() => setSelectedTrainee(null)}
                        onQualAdded={fetchQuals}
                    />
                )}

                {/* Evaluator generic details modal */}
                {selectedDetails && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'var(--panel-bg)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border-color)',
                                padding: '25px',
                                borderRadius: '8px',
                                width: '400px',
                                maxWidth: '90%',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                color: 'var(--text-color)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid var(--border-color)',
                                    paddingBottom: '10px',
                                    marginBottom: '15px',
                                }}
                            >
                                <h3 style={{ margin: 0, fontWeight: 600 }}>
                                    {selectedDetails.type} Details
                                </h3>
                                <button
                                    onClick={() => setSelectedDetails(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        color: 'var(--text-color)',
                                    }}
                                >
                                    &times;
                                </button>
                            </div>

                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: '0 0 20px 0',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                }}
                            >
                                {Object.entries(selectedDetails)
                                    .filter(([key]) => key !== 'type' && key !== 'pw_hash')
                                    .map(([key, value]) => (
                                        <li
                                            key={key}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '8px 0',
                                                borderBottom: '1px solid var(--border-color)',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <strong
                                                style={{
                                                    textTransform: 'capitalize',
                                                    color: 'var(--text-color)',
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {key.replace(/_/g, ' ')}:
                                            </strong>
                                            <span style={{ textAlign: 'right', fontWeight: 500 }}>
                                                {typeof value === 'boolean'
                                                    ? value
                                                        ? 'True'
                                                        : 'False'
                                                    : String(value ?? 'N/A')}
                                            </span>
                                        </li>
                                    ))}
                            </ul>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setSelectedDetails(null)}
                                    style={{
                                        backgroundColor: '#215b93',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                    }}
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
