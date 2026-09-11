import { useState, useEffect } from 'react'
import TraineeModal from './TraineeModal'
import Navbar from './Navbar'
import './EvaluatorHome.css'

const API_BASE = 'http://127.0.0.1:8080'

function EvaluatorHome() {
    const [trainees, setTrainees] = useState([])
    const [qualifications, setQualifications] = useState([])
    const [personnelCerts, setPersonnelCerts] = useState([])
    const [weaponSystems, setWeaponSystems] = useState([])
    const [crewRoles, setCrewRoles] = useState([])
    const [certifications, setCertifications] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTrainee, setSelectedTrainee] = useState(null)

    // Filter States
    const [selectedUnit, setSelectedUnit] = useState('All')
    const [selectedStatus, setSelectedStatus] = useState('All')
    const [selectedCert, setSelectedCert] = useState('Any')

    // Add Trainee Modal State
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTrainee, setNewTrainee] = useState({ first_name: '', last_name: '', rank: '' })

    const fetchTrainees = () => {
        fetch(`${API_BASE}/personnel`)
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)
    }

    const fetchQualifications = () => {
        fetch(`${API_BASE}/quals`)
            .then(res => res.json())
            .then(setQualifications)
            .catch(console.error)
    }

    const fetchPersonnelCerts = () => {
        fetch(`${API_BASE}/perscerts`)
            .then(res => res.json())
            .then(setPersonnelCerts)
            .catch(console.error)
    }

    useEffect(() => {
        fetchTrainees()
        fetchQualifications()
        fetchPersonnelCerts()

        fetch(`${API_BASE}/weaponsystems`)
            .then(res => res.json())
            .then(setWeaponSystems)
            .catch(console.error)

        fetch(`${API_BASE}/crewroles`)
            .then(res => res.json())
            .then(setCrewRoles)
            .catch(console.error)

        fetch(`${API_BASE}/certs`)
            .then(res => res.json())
            .then(setCertifications)
            .catch(console.error)
    }, [])

    const getTraineeName = (t) => `${t.first_name || ''} ${t.last_name || ''}`.trim()

    const getQualsForTrainee = (personnelId) => {
        const record = qualifications.find(q => q.personId === personnelId)
        return record?.qualifications || []
    }

    const getCertsForTrainee = (trainee) => {
        const name = getTraineeName(trainee).toLowerCase()
        const record = personnelCerts.find(
            (p) => (p.member || '').trim().toLowerCase() === name
        )
        return record?.certifications || []
    }

    const uniqueUnits = ['All', ...new Set(trainees.map(t => t.unit).filter(Boolean))]
    const uniqueStatuses = ['All', ...new Set(trainees.map(t => t.status).filter(Boolean))]

    const filteredTrainees = trainees.filter(t => {
        const term = searchQuery.toLowerCase()
        const fullName = getTraineeName(t).toLowerCase()
        const matchesSearch = fullName.includes(term) || t.rank?.toLowerCase().includes(term)

        const matchesUnit = selectedUnit === 'All' || t.unit === selectedUnit
        const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus

        const quals = getQualsForTrainee(t.id)
        const matchesCert = selectedCert === 'Any' || quals.some(q => String(q.systemId) === String(selectedCert))

        return matchesSearch && matchesUnit && matchesStatus && matchesCert
    })

    const handleAddSubmit = async (e) => {
        e.preventDefault()
        if (!newTrainee.first_name || !newTrainee.last_name || !newTrainee.rank) {
            alert('Please fill out all required fields.')
            return
        }

        try {
            const res = await fetch(`${API_BASE}/personnel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrainee),
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to add trainee')
                return
            }
            fetchTrainees()
            setShowAddModal(false)
            setNewTrainee({ first_name: '', last_name: '', rank: '' })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <Navbar />
            <div className="evaluator-container">
                {/* Search and Filters Section */}
                <div className="search-filter-section">
                    <div className="search-bar-container">
                        <span className="search-label">
                            SEARCH PERSONNEL
                        </span>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Name, MOS, unit, or certification"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filters-bar">
                        <span>FILTERS</span>
                        <div className="filter-row">
                            <label>
                                Unit:{' '}
                                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                                    {uniqueUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Status:{' '}
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                    {uniqueStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Certification:{' '}
                                <select value={selectedCert} onChange={(e) => setSelectedCert(e.target.value)}>
                                    <option value="Any">Any</option>
                                    {weaponSystems.map(sys => (
                                        <option key={sys.id} value={sys.id}>{sys.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Main Layout: Trainees Panel & Actions */}
                <div className="evaluator-top-row">
                    <div className="trainees-panel">
                        <div className="trainees-header">
                            <h3>Trainees</h3>
                            <button className="add-new-btn" onClick={() => setShowAddModal(true)}>Add new</button>
                        </div>

                        <div className="trainees-list-header">
                            <span>• name | Quals | Certs</span>
                            <span>Add/edit/remove</span>
                        </div>

                        <ul className="trainees-list">
                            {filteredTrainees.length === 0 ? (
                                <li className="no-trainees-msg">No trainees found.</li>
                            ) : (
                                filteredTrainees.map(t => {
                                    const quals = getQualsForTrainee(t.id)
                                    const certs = getCertsForTrainee(t)
                                    return (
                                        <li key={t.id}>
                                            <span>
                                                {t.rank} {t.first_name} {t.last_name}
                                                {' | '}
                                                {quals.length > 0
                                                    ? quals.map(q => q.system).join(', ')
                                                    : 'No quals'}
                                                {' | '}
                                                {certs.length > 0
                                                    ? certs.map(c => c.certification).join(', ')
                                                    : 'No certs'}
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

                {/* Trainee Details / Qualification Modal */}
                {selectedTrainee && (
                    <TraineeModal
                        trainee={selectedTrainee}
                        weaponSystems={weaponSystems}
                        crewRoles={crewRoles}
                        certifications={certifications}
                        onClose={() => setSelectedTrainee(null)}
                        onQualAdded={() => {
                            fetchQualifications()
                            fetchPersonnelCerts()
                        }}
                    />
                )}

                {/* Add New Trainee Form Modal */}
                {showAddModal && (
                    <div className="modal-overlay blur-bg">
                        <div className="add-trainee-modal">
                            <div className="add-modal-header">
                                <h3>Add New Trainee</h3>
                                <button className="close-icon-btn" onClick={() => setShowAddModal(false)}>
                                    &times;
                                </button>
                            </div>

                            <form className="add-trainee-form" onSubmit={handleAddSubmit}>
                                <label className="form-label">
                                    Rank:
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="e.g. TSgt, Capt, Spc"
                                        value={newTrainee.rank}
                                        onChange={(e) => setNewTrainee({ ...newTrainee, rank: e.target.value })}
                                        required
                                    />
                                </label>

                                <label className="form-label">
                                    First Name:
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="First Name"
                                        value={newTrainee.first_name}
                                        onChange={(e) => setNewTrainee({ ...newTrainee, first_name: e.target.value })}
                                        required
                                    />
                                </label>

                                <label className="form-label">
                                    Last Name:
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Last Name"
                                        value={newTrainee.last_name}
                                        onChange={(e) => setNewTrainee({ ...newTrainee, last_name: e.target.value })}
                                        required
                                    />
                                </label>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Add Trainee
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default EvaluatorHome