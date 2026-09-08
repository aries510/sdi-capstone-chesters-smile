import { useState, useEffect } from 'react'
import './AdminHome.css'
import EvaluatorsPanel from './EvaluatorsPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog'

function AdminHome() {

    const [evaluators, setEvaluators] = useState([]);
    const [trainees, setTrainees] = useState([]);
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-theme', !darkMode);
    }

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/users`)
            .then(res => res.json())
            .then(users => setEvaluators(users.filter(u => u.is_evaluator)))
            .catch(console.error)

        fetch('http://127.0.0.1:8080/personnel')
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)

    }, [])



    return (
        <div className='admin-container'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className='admin-title'>Admin Dashboard</h1>
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
                                            <span style={{ fontSize: '0.75rem', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px' }}>
                                                Trainee
                                            </span>
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
                    trainees={trainees}
                    onEvaluatorAdded={(newEvaluator) => {
                        setEvaluators(prev => [...prev, newEvaluator]);
                    }}
                    onEvaluatorUpdated={(updatedUser) => {
                        if (updatedUser.is_evaluator) {
                            setEvaluators(prev => {
                                const exists = prev.some(e => e.id === updatedUser.id);
                                if (exists) {
                                    return prev.map(e => e.id === updatedUser.id ? updatedUser : e);
                                }
                                return [...prev, updatedUser];
                            });
                        } else {
                            setEvaluators(prev => prev.filter(e => e.id !== updatedUser.id));
                        }
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

export default AdminHome
