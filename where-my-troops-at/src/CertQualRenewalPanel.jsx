import { useState } from "react"

function CertQualRenewalPanel() {
    const [renewals, setRenewals] = useState([]);

    return (
        <div className="panel">
            <h3>Upcoming cert Renewals & Quals:</h3>
            <ul>
                {renewals.map(r => (
                    <li key={r.id}>{r.name} | {r.certType}</li>
                ))}
            </ul>
        </div>
    );
}

export default CertQualRenewalPanel