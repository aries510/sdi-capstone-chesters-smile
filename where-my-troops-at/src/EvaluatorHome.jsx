import { useState, useEffect } from 'react'
import TraineeModal from './TraineeModal'
import './EvaluatorHome.css'

function EvaluatorHome() {
    const [trainees, setTrainees] = useState([])
    const [qualifications, setQualifications] = useState([])
    const [weaponSystems, setWeaponSystems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTrainee, setSelectedTrainee] = useState(null)

    const fetchTrainees = () => {
        fetch(`http://127.0.0.1/personnel`)
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)
    }

    useEffect(() => {
        fetchTrainees()

        fetch(`http://127.0.0.1/quals`)
            .then(res => res.json())
            .then(setQualifications)
            .catch(console.error)

        fetch(`http://127.0.0.1/weaponsystems`)
            .then(res => res.json())
            .then(setWeaponSystems)
            .catch(console.error)
    }, [])

    const getQualsForTrainee = (personnelId) =>
        qualifications.filter(q => q.personnel_id === personnelId)

    const getSystemName = (systemId) => {
        const sys = weaponSystems.find(s => s.id === systemId)
        return sys ? sys.name : `System #${systemId}`
    }

    const filteredTrainees = trainees.filter(t => {
        const term = searchQuery.toLowerCase()
        const fullName = `${t.first_name} ${t.last_name}`.toLowerCase()
        return fullName.includes(term) || t.rank?.toLowerCase().includes(term)
    })

    const handleAddNew = async () => {
        const firstName = prompt('First name:')
        if (!firstName) return
        const lastName = prompt('Last name:')
        if (!lastName) return
        const rank = prompt('Rank:')
        if (!rank) return

        try {
            const res = await fetch(`http://127.0.0.1/personnel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, rank }),
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to add trainee')
                return
            }
            fetchTrainees()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="evaluator-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="evaluator-title" style={{ textAlign: 'center', marginBottom: '24px' }}>Evaluator</h1>

            {/* Search and Filters Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxWidth: '520px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>SEARCH PERSONNEL</span>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Name, MOS, unit, or certification"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-color)' }}
                    />
                </div>

                <div className="filters-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 'bold' }}>FILTERS</span>
                    <div className="filter-row" style={{ display: 'flex', gap: '12px' }}>
                        <label>Unit: <select disabled style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px' }}><option>All ▼</option></select></label>
                        <label>Status: <select disabled style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px' }}><option>All ▼</option></select></label>
                        <label>Certification: <select disabled style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px' }}><option>Any ▼</option></select></label>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Main Layout: Trainees Panel & Actions */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div className="trainees-panel">
                    <div className="trainees-header">
                        <h3>Trainees</h3>
                        <button className="add-new-btn" onClick={handleAddNew}>Add new</button>
                    </div>

                    <div className="trainees-list-header">
                        <span>• name | Quals | Qual date</span>
                        <span>Add/edit/remove</span>
                    </div>

                    <ul className="trainees-list">
                        {filteredTrainees.length === 0 ? (
                            <li style={{ fontSize: '0.85rem', opacity: 0.7, padding: '12px 4px' }}>No trainees found.</li>
                        ) : (
                            filteredTrainees.map(t => {
                                const quals = getQualsForTrainee(t.id)
                                return (
                                    <li key={t.id}>
                                        <span>
                                            {t.rank} {t.first_name} {t.last_name}
                                            {' | '}
                                            {quals.length > 0
                                                ? quals.map(q => getSystemName(q.system_id)).join(', ')
                                                : 'No quals'}
                                            {' | '}
                                            {quals.length > 0 ? quals[0].qualified_date : '—'}
                                        </span>
                                        <button onClick={() => setSelectedTrainee(t)}>Edit</button>
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </div>

                <div className="evaluator-actions">
                    <div className="upload-button">UPLOAD DOCUMENT</div>
                    <div className="import-button">+ BULK IMPORT • PDF / CSV</div>
                </div>
            </div>

            {selectedTrainee && (
                <TraineeModal
                    trainee={selectedTrainee}
                    quals={getQualsForTrainee(selectedTrainee.id)}
                    weaponSystems={weaponSystems}
                    getSystemName={getSystemName}
                    onClose={() => setSelectedTrainee(null)}
                    onQualAdded={() => {
                        fetch(`${import.meta.env.VITE_API_URL}/quals`)
                            .then(res => res.json())
                            .then(setQualifications)
                            .catch(console.error)
                    }}
                />
            )}
        </div>
    )
}

export default EvaluatorHome