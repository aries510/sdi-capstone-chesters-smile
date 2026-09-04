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
                    <ul>{evaluators.map(e => <li key={e.id}>{e.username}</li>)}</ul>
                    <ul>{trainees.map(t => <li key={t.id}>{t.rank} {t.first_name} {t.last_name}</li>)}</ul>
                </div>

                <div className='admin-actions'>
                    <div className='upload-button'>UPLOAD DOCUMENT</div>
                    <div className='import-button'>+ BULK IMPORT PDF/CSV</div>
                </div>
            </div>



            <div className='admin-panels'>
                <EvaluatorsPanel evaluators={evaluators} />
                <CertQualRenewalPanel />
            </div>

            <CertificationCatalog />
        </div>
    )
}

export default AdminHome
