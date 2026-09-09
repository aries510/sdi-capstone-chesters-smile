import { useState, useEffect } from 'react'
import './AdminHome.css'
import EvaluatorsPanel from './EvaluatorsPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog'
import logo from './bg-images/spaceforcelogo.png';

function AdminHome() {
    const [evaluators, setEvaluators] = useState([]);
    const [standardUsers, setStandardUsers] = useState([]);
    const [trainees, setTrainees] = useState([]);
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-theme', !darkMode);
    }

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/users`)
            .then(res => res.json())
            .then(users => {
                setEvaluators(users.filter(u => u.is_evaluator));
                setStandardUsers(users.filter(u => !u.is_evaluator));
            })
            .catch(console.error)

        fetch('http://127.0.0.1:8080/personnel')
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)
    }, [])

    // Delete Trainee / Personnel Record
    const handleDeleteTrainee = async (id) => {
        if (!window.confirm("Are you sure you want to remove this trainee from the unit?")) return;

        try {
            const res = await fetch(`http://127.0.0.1:8080/personnel/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete trainee');

            setTrainees(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className='admin-container'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='admin-header'>
                    <img src={logo} alt='Space Force Logo' className='admin-logo' />
                    <span>Admin Dashboard</span>
                </div>
                <button onClick={toggleDarkMode} className='new-btn'>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>

            <div className='top-row'>
                <div className='eval-trainee-list'>
                    <h3>Evaluators and Trainees</h3>

                    <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0.5rem 0', color: '#2563eb' }}>Evaluators</h4>
                            {evaluators.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No evaluators found.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                                    {evaluators.map(e => (
                                        <li key={e.id} style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{e.username}</span>
                                            <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px' }}>
                                                Evaluator
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h4 style={{ margin: '0.5rem 0', color: '#059669' }}>Trainees</h4>
                            {trainees.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>No trainees found.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                                    {trainees.map(t => (
                                        <li key={t.id} style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{t.rank} {t.first_name} {t.last_name}</span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px' }}>
                                                    Trainee
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTrainee(t.id)}
                                                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}
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

                <div className='admin-actions'>
                    <div className='upload-button'>UPLOAD DOCUMENT</div>
                    <div className='import-button'>+ BULK IMPORT PDF/CSV</div>
                </div>
            </div>

            <div className='admin-panels'>
                <EvaluatorsPanel
                    evaluators={evaluators}
                    standardUsers={standardUsers}
                    trainees={trainees}
                    onEvaluatorAdded={(newEvaluator) => {
                        const user = Array.isArray(newEvaluator) ? newEvaluator[0] : (newEvaluator.user || newEvaluator);
                        setEvaluators(prev => [...prev, user]);
                    }}
                    onEvaluatorUpdated={(updatedData) => {
                        const user = Array.isArray(updatedData) ? updatedData[0] : (updatedData.user || updatedData);
                        if (!user || !user.id) return;

                        const isEvaluator = Boolean(user.is_evaluator);

                        if (isEvaluator) {
                            setEvaluators(prev => {
                                const exists = prev.some(e => Number(e.id) === Number(user.id));
                                return exists ? prev.map(e => Number(e.id) === Number(user.id) ? user : e) : [...prev, user];
                            });
                            setStandardUsers(prev => prev.filter(u => Number(u.id) !== Number(user.id)));
                        } else {
                            setEvaluators(prev => prev.filter(e => Number(e.id) !== Number(user.id)));
                            setStandardUsers(prev => {
                                const exists = prev.some(u => Number(u.id) === Number(user.id));
                                return exists ? prev.map(u => Number(u.id) === Number(user.id) ? user : u) : [...prev, user];
                            });
                        }
                    }}
                    onEvaluatorDeleted={(id) => {
                        setEvaluators(prev => prev.filter(e => Number(e.id) !== Number(id)));
                    }}
                />
                <CertQualRenewalPanel />
            </div>

            <div className='catalog-wrapper'>
                <CertificationCatalog />
            </div>
        </div>
    );
}

export default AdminHome;