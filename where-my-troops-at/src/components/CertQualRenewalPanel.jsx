import { useEffect, useState } from 'react';

function CertQualRenewalPanel() {
  const [renewals, setRenewals] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/perscerts')
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + 30);

        const upcomingList = [];

        data.forEach((person) => {
          if (Array.isArray(person.certifications)) {
            person.certifications.forEach((cert) => {
              const expiry = new Date(cert.expiry_date);

              if (expiry >= now && expiry <= soon) {
                upcomingList.push({
                  id: `${person.member}-${cert.certification}-${cert.expiry_date}`,
                  memberName: `${person.rank ? person.rank + ' ' : ''}${person.member}`,
                  certName: cert.certification,
                  expiryDate: cert.expiry_date,
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
    <div className="panel">
      <h3>Upcoming Cert Renewals & Quals</h3>
      {renewals.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '10px' }}>
          No certifications expiring in the next 30 days.
        </p>
      ) : (
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          {renewals.map((r) => (
            <li key={r.id} style={{ marginBottom: '6px' }}>
              <strong>{r.memberName}</strong> — {r.certName} (Expires:{' '}
              {r.expiryDate})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CertQualRenewalPanel;
