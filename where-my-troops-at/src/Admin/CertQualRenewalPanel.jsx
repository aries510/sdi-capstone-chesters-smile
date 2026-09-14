import { useEffect, useState } from "react";
// Added global 'SERVER_URL' in utils>api.js. Should make production conversion easier - Jacob
import { SERVER_URL } from '../utils/api';

function CertQualRenewalPanel() {
    const [renewals, setRenewals] = useState([]);

    useEffect(() => {
        fetch(`${SERVER_URL}/perscerts`)
            .then(res => res.json())
            .then(data => {
                const now = new Date();
                const soon = new Date();
                soon.setDate(now.getDate() + 30);

                const upcomingList = [];

                data.forEach(person => {
                    if (Array.isArray(person.certifications)) {
                        person.certifications.forEach(cert => {
                            const expiry = new Date(cert.expiry_date);

                            if (expiry >= now && expiry <= soon) {
                                upcomingList.push({
                                    id: `${person.member}-${cert.certification}-${cert.expiry_date}`,
                                    memberName: `${person.rank ? person.rank + ' ' : ''}${person.member}`,
                                    certName: cert.certification,
                                    expiryDate: cert.expiry_date
                                });
                            }
                        });
                    }
                });

                setRenewals(upcomingList);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="trainees-panel">
            <div className="trainees-header">
                <h3>Upcoming Cert Renewals & Quals</h3>
            </div>
            {renewals.length === 0 ? (
                <p className="no-trainees-msg">
                    No certifications expiring in the next 30 days.
                </p>
            ) : (
                <ul className="trainees-list">
                    {renewals.map(r => (
                        <li key={r.id}>
                            <span>
                                <strong>{r.memberName}</strong> — {r.certName}
                            </span>
                            <span className="tag-empty">Expires: {r.expiryDate}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CertQualRenewalPanel;