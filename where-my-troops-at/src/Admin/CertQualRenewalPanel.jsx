import { useEffect, useState } from 'react';
import { SERVER_URL } from '../utils/api';

function CertQualRenewalPanel() {
  const [renewals, setRenewals] = useState([]);

  useEffect(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);

    const qualsPromise = fetch(`${SERVER_URL}/quals`)
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
        return [];
      });

    const certsPromise = fetch(`${SERVER_URL}/perscerts`)
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
        return [];
      });

    Promise.all([qualsPromise, certsPromise]).then(([qualsData, certsData]) => {
      // personId -> { personId, memberName, quals: [], certs: [] }
      const byPerson = new Map();

      const getOrCreatePerson = (personId, rank, member) => {
        if (!byPerson.has(personId)) {
          byPerson.set(personId, {
            personId,
            memberName: `${rank ? rank + ' ' : ''}${member}`,
            quals: [],
            certs: [],
          });
        }
        return byPerson.get(personId);
      };

      // Qualifications: /quals has no expiry_date field - a qualification is
      // valid for exactly one year from qualified_date, so we derive the
      // implied expiry ourselves (matches the backend's own is_current calc).
      if (Array.isArray(qualsData)) {
        qualsData.forEach((person) => {
          if (!Array.isArray(person.qualifications)) return;

          person.qualifications.forEach((qual) => {
            const qualifiedDate = new Date(qual.qualified_date);
            const expiry = new Date(qualifiedDate);
            expiry.setFullYear(expiry.getFullYear() + 1);

            if (expiry <= soon) {
              const entry = getOrCreatePerson(
                person.personId,
                person.rank,
                person.member,
              );
              entry.quals.push({
                id: `qual-${person.personId}-${qual.roleId}-${qual.systemId}`,
                label: `${qual.role} — ${qual.system}`,
                expiryDate: expiry.toISOString().slice(0, 10),
                isExpired: !qual.is_current,
              });
            }
          });
        });
      }

      // Certifications: /perscerts has a real expiry_date + is_current, so no
      // need to derive anything - just filter on the actual date.
      if (Array.isArray(certsData)) {
        certsData.forEach((person) => {
          if (!Array.isArray(person.certifications)) return;

          person.certifications.forEach((cert) => {
            const expiry = new Date(cert.expiry_date);

            if (expiry <= soon) {
              const entry = getOrCreatePerson(
                person.personId,
                person.rank,
                person.member,
              );
              entry.certs.push({
                id: `cert-${person.personId}-${cert.certId}`,
                label: cert.certification,
                expiryDate: cert.expiry_date,
                isExpired: !cert.is_current,
              });
            }
          });
        });
      }

      const grouped = Array.from(byPerson.values())
        .map((person) => {
          person.quals.sort(
            (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
          );
          person.certs.sort(
            (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
          );

          const allDates = [...person.quals, ...person.certs].map(
            (i) => i.expiryDate,
          );
          person.earliestExpiry = allDates.sort()[0];

          return person;
        })
        .sort(
          (a, b) => new Date(a.earliestExpiry) - new Date(b.earliestExpiry),
        );

      setRenewals(grouped);
    });
  }, []);

  const badgeStyle = (isExpired) => ({
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginLeft: '6px',
    backgroundColor: isExpired
      ? 'rgba(220, 38, 38, 0.15)'
      : 'rgba(245, 158, 11, 0.15)',
    color: isExpired ? '#dc2626' : '#b45309',
    border: `1px solid ${isExpired ? 'rgba(220, 38, 38, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
  });

  const renderSubList = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div style={{ marginTop: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7 }}>
          {title}
        </span>
        <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px' }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'list-item',
                border: 'none',
                padding: '2px 0',
                fontSize: '0.85rem',
              }}
            >
              {item.label}
              <span style={badgeStyle(item.isExpired)}>
                {item.isExpired ? 'Expired' : 'Expiring Soon'}:{' '}
                {item.expiryDate}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="trainees-panel">
      <div className="trainees-header">
        <h3>
          Action Required: Expired & Upcoming Certifications/Qualifications
        </h3>
      </div>
      {renewals.length === 0 ? (
        <p className="no-trainees-msg">
          No qualifications or certifications expired or expiring in the next 30
          days.
        </p>
      ) : (
        <ul className="trainees-list">
          {renewals.map((person) => (
            <li
              key={person.personId}
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <strong>{person.memberName}</strong>
              {renderSubList('Qualifications', person.quals)}
              {renderSubList('Certifications', person.certs)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CertQualRenewalPanel;
