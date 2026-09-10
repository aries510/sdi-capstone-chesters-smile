import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8080'

// Shared modal for viewing + assigning a trainee's qualifications and
// certifications. Used identically by AdminHome and EvaluatorHome — both
// just need to pass: trainee, weaponSystems, crewRoles, certifications,
// onClose, onQualAdded. The modal fetches the trainee's *current* data
// itself, so parents don't need to pre-filter anything person-specific.
function TraineeModal({
    trainee,
    weaponSystems,
    crewRoles,
    certifications,
    onClose,
    onQualAdded
}) {
    const [activeTab, setActiveTab] = useState('system')

    const safeSystems = Array.isArray(weaponSystems) ? weaponSystems : []
    const safeRoles = Array.isArray(crewRoles) ? crewRoles : []
    const safeCerts = Array.isArray(certifications) ? certifications : []
    const safeTrainee = trainee || {}

    // Add-form states
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedSystem, setSelectedSystem] = useState('')
    const [selectedCert, setSelectedCert] = useState('')
    const [expiryDate, setExpiryDate] = useState('')

    // Current-data states (self-fetched per trainee)
    const [currentQuals, setCurrentQuals] = useState([])
    const [currentCerts, setCurrentCerts] = useState([])
    const [loadingCurrent, setLoadingCurrent] = useState(true)

    // Inline edit state for a cert's expiry date
    const [editingCertName, setEditingCertName] = useState(null)
    const [editExpiryDate, setEditExpiryDate] = useState('')

    const memberName = `${safeTrainee.first_name || ''} ${safeTrainee.last_name || ''}`.trim() || safeTrainee.name || ''
    const today = new Date().toISOString().slice(0, 10)

    const getItemName = (item) => {
        if (!item) return ''
        if (typeof item === 'string') return item
        return item.name || item.role || item.title || item.certification || item.system || ''
    }

    const getRoleName = (roleId) => {
        const role = safeRoles.find(r => r.id === roleId)
        return role ? role.name : `Role #${roleId}`
    }

    const getSystemName = (systemId) => {
        const sys = safeSystems.find(s => s.id === systemId)
        return sys ? sys.name : `System #${systemId}`
    }

    const getCertId = (certName) => {
        const cert = safeCerts.find(c => c.name === certName)
        return cert ? cert.id : null
    }

    const fetchCurrentData = () => {
        if (!safeTrainee.id || !memberName) return
        setLoadingCurrent(true)

        // Weapon system quals: /quals doesn't support filtering by person as
        // far as confirmed, so fetch all and filter client-side by personnel_id.
        const qualsPromise = fetch(`${API_BASE}/quals`)
            .then(res => res.json())
            .then(data => data.filter(q => q.personnel_id === safeTrainee.id))
            .catch(err => {
                console.error(err)
                return []
            })

        // Personnel certs: /perscerts supports a ?member= filter directly.
        const certsPromise = fetch(`${API_BASE}/perscerts?member=${encodeURIComponent(memberName)}`)
            .then(res => res.json())
            .then(data => {
                const record = Array.isArray(data) ? data[0] : data
                return record?.certifications || []
            })
            .catch(err => {
                console.error(err)
                return []
            })

        Promise.all([qualsPromise, certsPromise]).then(([quals, certs]) => {
            setCurrentQuals(quals)
            setCurrentCerts(certs)
            setLoadingCurrent(false)
        })
    }

    useEffect(() => {
        fetchCurrentData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeTrainee.id])

    const handleResponse = async (res) => {
        const contentType = res.headers.get("content-type")
        if (!res.ok) {
            let errorMsg = `Server Error ${res.status}: `
            if (contentType && contentType.includes("application/json")) {
                const errorData = await res.json()
                errorMsg += errorData.error || 'Unknown backend error'
            } else {
                errorMsg += await res.text()
            }
            throw new Error(errorMsg)
        }
        return contentType && contentType.includes("application/json") ? res.json() : res.text()
    }

    const refreshAll = () => {
        fetchCurrentData()
        if (onQualAdded) onQualAdded()
    }

    // Tab 1: Weapon Systems Qualification
    const handleAddSystemQual = async (e) => {
        e.preventDefault()
        if (!selectedRole || !selectedSystem) return alert('Select Crew Role and Weapon System.')

        try {
            const res = await fetch(`${API_BASE}/quals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member: memberName,
                    role: selectedRole,
                    system: selectedSystem,
                    qualified_date: today
                })
            })
            await handleResponse(res)
            setSelectedSystem('')
            refreshAll()
        } catch (err) {
            if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
                alert('This person already has that role/system qualification assigned.')
            } else {
                alert('Failed to assign weapon qualification:\n' + err.message)
            }
        }
    }

    // Tab 2: Personnel Certifications
    const handleAddPersCert = async (e) => {
        e.preventDefault()
        if (!selectedCert || !expiryDate) return alert('Select a Certification and an expiry date.')

        try {
            const res = await fetch(`${API_BASE}/perscerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member: memberName,
                    cert: selectedCert,
                    date_earned: today,
                    expiry_date: expiryDate,
                })
            })
            await handleResponse(res)
            setSelectedCert('')
            setExpiryDate('')
            refreshAll()
        } catch (err) {
            alert('Failed to assign personnel certification:\n' + err.message)
        }
    }

    // Tab 3: Crew Role Certifications (role-wide, not person-specific)
    const handleAddCrewCert = async (e) => {
        e.preventDefault()
        if (!selectedRole || !selectedCert) return alert('Select Crew Role and Certification.')

        try {
            const res = await fetch(`${API_BASE}/crewcerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crewRole: selectedRole,
                    certification: selectedCert
                })
            })
            await handleResponse(res)
            refreshAll()
        } catch (err) {
            alert('Failed to link crew certification:\n' + err.message)
        }
    }

    // Edit an existing cert's expiry date
    const handleStartEditCert = (cert) => {
        setEditingCertName(cert.certification)
        setEditExpiryDate(cert.expiry_date ? cert.expiry_date.slice(0, 10) : '')
    }

    const handleSaveCertEdit = async (certName) => {
        const certId = getCertId(certName)
        if (!certId) {
            alert('Could not resolve certification id — check that the certifications list is loaded.')
            return
        }

        try {
            const res = await fetch(`${API_BASE}/perscerts/${safeTrainee.id}/${certId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiry_date: editExpiryDate })
            })
            await handleResponse(res)
            setEditingCertName(null)
            refreshAll()
        } catch (err) {
            alert('Failed to update certification:\n' + err.message)
        }
    }

    const handleRemoveCert = async (certName) => {
        const certId = getCertId(certName)
        if (!certId) {
            alert('Could not resolve certification id — check that the certifications list is loaded.')
            return
        }
        if (!window.confirm(`Remove ${certName} from ${memberName}?`)) return

        try {
            const res = await fetch(`${API_BASE}/perscerts/${safeTrainee.id}/${certId}`, {
                method: 'DELETE'
            })
            if (!res.ok && res.status !== 204) await handleResponse(res)
            refreshAll()
        } catch (err) {
            alert('Failed to remove certification:\n' + err.message)
        }
    }

    if (!trainee) return null

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '8px', width: '560px', maxHeight: '85vh', overflowY: 'auto', color: '#f8fafc' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Assign Qualifications</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                </div>

                <p style={{ fontWeight: 'bold', marginBottom: '15px', color: '#94a3b8' }}>
                    {safeTrainee.rank ? `${safeTrainee.rank} ` : ''}{memberName}
                </p>

                {(safeRoles.length === 0 || safeCerts.length === 0) && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '10px' }}>
                        {safeRoles.length === 0 && 'No crew roles loaded. '}
                        {safeCerts.length === 0 && 'No certifications loaded. '}
                        Check that this page is fetching /crewroles and /certs and passing them into this modal.
                    </p>
                )}

                {/* CURRENT ASSIGNMENTS */}
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Current Assignments</h4>

                    {loadingCurrent ? (
                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Loading...</p>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#94a3b8' }}>
                                Weapon System Qualifications
                            </p>
                            {currentQuals.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '12px' }}>None yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
                                    {currentQuals.map((q, i) => (
                                        <li key={i} style={{ fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid #334155' }}>
                                            {getSystemName(q.system_id)} — {getRoleName(q.crew_role_id)} ({q.qualified_date})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '-8px', marginBottom: '12px' }}>
                                Editing/removing weapon qualifications isn't wired up yet — pending confirmation of a
                                PATCH/DELETE route for crew_qualifications from the backend team.
                            </p>

                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#94a3b8' }}>
                                Certifications
                            </p>
                            {currentCerts.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>None yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {currentCerts.map((c, i) => (
                                        <li key={i} style={{ fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                                            {editingCertName === c.certification ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{c.certification} — expires:</span>
                                                    <input
                                                        type="date"
                                                        value={editExpiryDate}
                                                        onChange={(e) => setEditExpiryDate(e.target.value)}
                                                        style={{ padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                                                    />
                                                    <button onClick={() => handleSaveCertEdit(c.certification)} style={{ padding: '4px 10px', background: '#215b93', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                                                    <button onClick={() => setEditingCertName(null)} style={{ padding: '4px 10px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>
                                                        {c.certification} — earned {c.date_earned}, expires {c.expiry_date}
                                                        {' '}
                                                        <span style={{ color: c.is_current ? '#22c55e' : '#ef4444' }}>
                                                            ({c.is_current ? 'current' : 'expired'})
                                                        </span>
                                                    </span>
                                                    <span style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleStartEditCert(c)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                                        <button onClick={() => handleRemoveCert(c.certification)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                                    </span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>

                {/* ADD NEW */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Add New</h4>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                    {['system', 'perscert', 'crewcert'].map(tab => (
                        <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ padding: '6px 12px', background: activeTab === tab ? '#215b93' : 'transparent', color: '#fff', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>
                            {tab === 'system' ? 'Weapon System' : tab === 'perscert' ? 'Personnel Cert' : 'Crew Role Cert'}
                        </button>
                    ))}
                </div>

                {(activeTab === 'system' || activeTab === 'crewcert') && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Target Crew Role:</label>
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                            <option value="">-- Select Crew Role --</option>
                            {safeRoles.map((role, i) => <option key={i} value={getItemName(role)}>{getItemName(role)}</option>)}
                        </select>
                    </div>
                )}

                {activeTab === 'system' && (
                    <form onSubmit={handleAddSystemQual}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Weapon System:</label>
                            <select value={selectedSystem} onChange={(e) => setSelectedSystem(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                                <option value="">-- Select Weapon System --</option>
                                {safeSystems.map((sys, i) => <option key={i} value={getItemName(sys)}>{getItemName(sys)}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="submit" style={{ padding: '8px 16px', background: '#215b93', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Qualification</button>
                        </div>
                    </form>
                )}

                {activeTab === 'perscert' && (
                    <form onSubmit={handleAddPersCert}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Certification:</label>
                            <select value={selectedCert} onChange={(e) => setSelectedCert(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                                <option value="">-- Select Certification --</option>
                                {safeCerts.map((cert, i) => <option key={i} value={getItemName(cert)}>{getItemName(cert)}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Expiry Date:</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="submit" style={{ padding: '8px 16px', background: '#215b93', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Assign Personnel Cert
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'crewcert' && (
                    <form onSubmit={handleAddCrewCert}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Certification:</label>
                            <select value={selectedCert} onChange={(e) => setSelectedCert(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                                <option value="">-- Select Certification --</option>
                                {safeCerts.map((cert, i) => <option key={i} value={getItemName(cert)}>{getItemName(cert)}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="submit" style={{ padding: '8px 16px', background: '#215b93', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Link Role Cert
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default TraineeModal