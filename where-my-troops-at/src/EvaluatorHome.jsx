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
        <div className="evaluator-container">
            <h1 className="evaluator-title">Evaluator</h1>

            <input
                type="text"
                className="search-bar"
                placeholder="Name, MOS, unit, or certification"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="filters-bar">
                <span>FILTERS</span>
                <div className="filter-row">
                    <label>Unit: <select disabled><option>All</option></select></label>
                    <label>Status: <select disabled><option>All</option></select></label>
                    <label>Certification: <select disabled><option>Any</option></select></label>
                </div>
                {/* Unit / Status / Certification filters are UI placeholders —
            no matching columns exist on `personnel` yet. */}
            </div>

            <div className="trainees-panel">
                <div className="trainees-header">
                    <h3>Trainees</h3>
                    <button className="add-new-btn" onClick={handleAddNew}>Add new</button>
                </div>

                <div className="trainees-list-header">
                    <span>name | Quals | Qual date</span>
                    <span>Add/edit/remove</span>
                </div>

                <ul className="trainees-list">
                    {filteredTrainees.map(t => {
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
                    })}
                </ul>
            </div>

            <div className="evaluator-actions">
                <div className="upload-button">UPLOAD DOCUMENT</div>
                <div className="import-button">+ BULK IMPORT · PDF / CSV</div>
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