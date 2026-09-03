import { useState, useEffect, use } from 'react'
import './App.css'

function AdminHome() {

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div className='admin-top-row'></div>
            <div className='eval-trainee-list'>Evaluators and Trainees</div>
            <div className='admin-actions'>
                <div className='upload-button'>UPLOAD DOCUMENT</div>
                <div className='import-button'>+ BULK IMPORT PDF/CSV</div>
            </div>

            <div className='admin-panels'>
                <EvaluatorsPanel />
                <CertQualRenewalPanel />
            </div>
            <CertificanCatalog />
        </div>

    )
}

export default AdminHome
