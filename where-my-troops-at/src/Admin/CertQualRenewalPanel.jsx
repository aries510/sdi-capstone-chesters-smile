import { useEffect, useState } from "react";
import { SERVER_URL } from '../utils/api';

function CertQualRenewalPanel() {
    const [renewals, setRenewals] = useState([]);

    useEffect(() => {
        fetch(`${SERVER_URL}/quals`)
            .then(res => res.json())
            .then(data => {
                const now = new Date();
                const soon = new Date();
                soon.setDate(now.getDate() + 30);

                const actionItems = [];

                data.forEach(person => {
                    if (Array.isArray(person.certifications)) {
                        person.certifications.forEach(cert => {
                            const expiry = new Date(cert.expiry_date);

                            if (expiry <= soon) {
                                actionItems.push({
                                    id: `${person.member}-${cert.certification}-${cert.expiry_date}`,
                                    memberName: `${person.rank ? person.rank + ' ' : ''}${person.member}`,
                                    certName: cert.certification,
                                    expiryDate: cert.expiry_date,
                                    isExpired: cert.is_current !== undefined ? !cert.is_current : expiry < now
                                });
                            }
                        });
                    }
                });

                actionItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

                setRenewals(actionItems);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="trainees-panel">
            <div className="trainees-header">
                <h3>Action Required: Expired & Upcoming Certs</h3>
            </div>
            {renewals.length === 0 ? (
                <p className="no-trainees-msg">
                    No certifications expired or expiring in the next 30 days.
                </p>
            ) : (
                <ul className="trainees-list">
                    {renewals.map(r => (
                        <li key={r.id}>
                            <span>
                                <strong>{r.memberName}</strong> — {r.certName}
                            </span>
                            <span className={r.isExpired ? "tag-expired" : "tag-empty"}>
                                {r.isExpired ? 'Expired: ' : 'Expires: '}{r.expiryDate}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CertQualRenewalPanel;