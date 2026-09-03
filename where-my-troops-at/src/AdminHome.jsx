import { useState, useEffect, use } from 'react'
import './App.css'
import EvaluatorsPanel from './EvaluatorsPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog'

function AdminHome() {

    const [evaluators, setEvaluators] = useState([]);
    const [trainees, setTrainees] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.API_URL}/evaluators`)
            .then(res => res.json())
            .then(setEvaluators)
            .catch(console.error)

        fetch(`${import.meta.env.API_URL}/trainees`)
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)

    }, [])



    return (
        <div>
            <h1>Admin Dashboard</h1>

            <div className='eval-trainee-list'>
                <h3>Evaluators and Trainees</h3>
                <ul>{evaluators.map(e => <li key={e.id}>{e.name}</li>)}</ul>
                <ul>{trainees.map(t => <li key={t.id}>{t.name}</li>)}</ul>
            </div>

            <div className='admin-actions'>
                <div className='upload-button'>UPLOAD DOCUMENT</div>
                <div className='import-button'>+ BULK IMPORT PDF/CSV</div>
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
