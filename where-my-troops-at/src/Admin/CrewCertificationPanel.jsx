import { useEffect, useState } from 'react';
import { SERVER_URL } from '../utils/api';

export default function CrewCertificationPanel() {
    const [rows, setRows] = useState([]);
    const [crewRoles, setCrewRoles] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [crewRoleId, setCrewRoleId] = useState('');
    const [certId, setCertId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const loadRows = () => {
        fetch(`${SERVER_URL}/crewcerts`)
            .then((res) => res.json())
            .then((groups) =>
                setRows(
                    groups.flatMap((group) =>
                        group.certifications.map((c) => ({
                            roleId: group.roleId,
                            crew_role: group.crew_role,
                            certId: c.certId,
                            certification: c.certification,
                        })),
                    ),
                ),
            )
            .catch(console.error);
    };

    useEffect(() => {
        loadRows();

        fetch(`${SERVER_URL}/crewroles`)
            .then((res) => res.json())
            .then(setCrewRoles)
            .catch(console.error);

        fetch(`${SERVER_URL}/certs`)
            .then((res) => res.json())
            .then(setCertifications)
            .catch(console.error);
    }, []);

    const openCreateForm = () => {
        setCrewRoleId('');
        setCertId('');
        setError('');
        setIsFormOpen(true);
    };

    const linkedCertIdsForRole = (roleId) =>
        new Set(
            rows.filter((r) => Number(r.roleId) === Number(roleId)).map((r) => r.certId),
        );

    const availableCertifications = crewRoleId
        ? certifications.filter((c) => !linkedCertIdsForRole(crewRoleId).has(c.id))
        : certifications;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!crewRoleId || !certId) {
            setError('Select a crew role and a certification.');
            return;
        }

        const role = crewRoles.find((r) => Number(r.id) === Number(crewRoleId));
        const cert = certifications.find((c) => Number(c.id) === Number(certId));

        setIsLoading(true);

        try {
            const res = await fetch(`${SERVER_URL}/crewcerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ crewRole: role.name, certification: cert.name }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(capitalize(data.error || 'Failed to link certification.'));
            }

            setRows((prev) => [
                ...prev,
                { roleId: role.id, crew_role: role.name, certId: cert.id, certification: cert.name },
            ]);

            setIsFormOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        if (
            !window.confirm(
                `Remove "${row.certification}" as a requirement for ${row.crew_role}?`,
            )
        )
            return;

        try {
            const res = await fetch(`${SERVER_URL}/crewcerts/${row.roleId}/${row.certId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to remove requirement.');

            setRows((prev) =>
                prev.filter((r) => !(r.roleId === row.roleId && r.certId === row.certId)),
            );
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="panel" style={{ position: 'relative' }}>
            <div className="panel-header">
                <h3>Crew Certification Requirements</h3>
                <button className="new-btn" onClick={openCreateForm}>+ Add Requirement</button>
            </div>

            <ul className="panel-list">
                {rows.length === 0 ? (
                    <li style={{ padding: '8px 0' }}>No crew certification requirements found.</li>
                ) : (
                    rows.map((row) => (
                        <li
                            key={`${row.roleId}-${row.certId}`}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}
                        >
                            <div>
                                <div>{row.crew_role}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>requires {row.certification}</div>
                            </div>
                            <button
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', flexShrink: 0 }}
                                onClick={() => handleDelete(row)}
                            >
                                Remove
                            </button>
                        </li>
                    ))
                )}
            </ul>

            {isFormOpen && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    borderRadius: '4px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--panel-bg)',
                        padding: '20px',
                        borderRadius: '6px',
                        width: '85%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        color: 'var(--text-color)'
                    }}>
                        <h4 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            Add Certification Requirement
                        </h4>

                        {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <select
                                value={crewRoleId}
                                onChange={(e) => {
                                    setCrewRoleId(e.target.value);
                                    setCertId('');
                                }}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="" disabled>Select a crew role</option>
                                {crewRoles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>

                            <select
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                                required
                                disabled={!crewRoleId}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="" disabled>
                                    {crewRoleId ? 'Select a certification' : 'Select a crew role first'}
                                </option>
                                {availableCertifications.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#215b93', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    {isLoading ? 'Saving...' : 'Add Requirement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
