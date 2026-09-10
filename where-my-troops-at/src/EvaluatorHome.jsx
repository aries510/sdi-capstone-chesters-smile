import { useState, useEffect } from 'react'
import TraineeModal from './TraineeModal'
import './EvaluatorHome.css'
import logo from './bg-images/spaceforcelogo.png'

function EvaluatorHome() {
    const [trainees, setTrainees] = useState([])
    const [qualifications, setQualifications] = useState([])
    const [weaponSystems, setWeaponSystems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTrainee, setSelectedTrainee] = useState(null)
    const [darkMode, setDarkMode] = useState(false)

    // Filter States
    const [selectedUnit, setSelectedUnit] = useState('All')
    const [selectedStatus, setSelectedStatus] = useState('All')
    const [selectedCert, setSelectedCert] = useState('Any')

    // Add Trainee Modal State
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTrainee, setNewTrainee] = useState({ first_name: '', last_name: '', rank: '' })

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.body.classList.toggle('dark-theme', !darkMode)
    }

    const fetchTrainees = () => {
        fetch('http://127.0.0.1:8080/personnel')
            .then(res => res.json())
            .then(setTrainees)
            .catch(console.error)
    }

    useEffect(() => {
        fetchTrainees()

        fetch('http://127.0.0.1:8080/quals')
            .then(res => res.json())
            .then(setQualifications)
            .catch(console.error)

        fetch('http://127.0.0.1:8080/weaponsystems')
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

    // Dynamic dropdown lists derived from dataset
    const uniqueUnits = ['All', ...new Set(trainees.map(t => t.unit).filter(Boolean))]
    const uniqueStatuses = ['All', ...new Set(trainees.map(t => t.status).filter(Boolean))]

    // Filter Logic
    const filteredTrainees = trainees.filter(t => {
        const term = searchQuery.toLowerCase()
        const fullName = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase()
        const matchesSearch = fullName.includes(term) || t.rank?.toLowerCase().includes(term)

        const matchesUnit = selectedUnit === 'All' || t.unit === selectedUnit
        const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus

        const quals = getQualsForTrainee(t.id)
        const matchesCert = selectedCert === 'Any' || quals.some(q => String(q.system_id) === String(selectedCert))

        return matchesSearch && matchesUnit && matchesStatus && matchesCert
    })

    const handleAddSubmit = async (e) => {
        e.preventDefault()
        if (!newTrainee.first_name || !newTrainee.last_name || !newTrainee.rank) {
            alert('Please fill out all required fields.')
            return
        }

        try {
            const res = await fetch('http://127.0.0.1:8080/personnel', {
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
        <div className="evaluator-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header with Space Force Logo & Dark/Light Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div className="evaluator-header">
                    <img src={logo} alt="Space Force Logo" className="evaluator-logo" />
                    <div className="evaluator-title">Evaluator Dashboard</div>
                </div>
                <button onClick={toggleDarkMode} className="new-btn">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>

            {/* Search and Filters Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', color: '#ffffff' }}>
                        SEARCH PERSONNEL
                    </span>
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
                        <label>
                            Unit:{' '}
                            <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                style={{ background: 'var(--panel-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 4px' }}
                            >
                                {uniqueUnits.map(unit => (
                                    <option key={unit} value={unit} style={{ color: '#000' }}>{unit}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Status:{' '}
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ background: 'var(--panel-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 4px' }}
                            >
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status} style={{ color: '#000' }}>{status}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Certification:{' '}
                            <select
                                value={selectedCert}
                                onChange={(e) => setSelectedCert(e.target.value)}
                                style={{ background: 'var(--panel-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 4px' }}
                            >
                                <option value="Any" style={{ color: '#000' }}>Any</option>
                                {weaponSystems.map(sys => (
                                    <option key={sys.id} value={sys.id} style={{ color: '#000' }}>{sys.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Main Layout: Trainees Panel & Actions */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div className="trainees-panel">
                    <div className="trainees-header">
                        <h3>Trainees</h3>
                        <button className="add-new-btn" onClick={() => setShowAddModal(true)}>Add new</button>
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

            {/* Trainee Details / Qualification Modal */}
            {selectedTrainee && (
                <TraineeModal
                    trainee={selectedTrainee}
                    quals={getQualsForTrainee(selectedTrainee.id)}
                    weaponSystems={weaponSystems}
                    getSystemName={getSystemName}
                    onClose={() => setSelectedTrainee(null)}
                    onQualAdded={() => {
                        fetch('http://127.0.0.1:8080/quals')
                            .then(res => res.json())
                            .then(setQualifications)
                            .catch(console.error)
                    }}
                />
            )}

            {/* Add New Trainee Form Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--panel-bg, #1e293b)',
                        border: '1px solid var(--border-color, #334155)',
                        padding: '25px',
                        borderRadius: '8px',
                        width: '400px',
                        maxWidth: '90%',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        color: 'var(--text-color, #f8fafc)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontWeight: 600 }}>Add New Trainee</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-color)' }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                Rank:
                                <input
                                    type="text"
                                    placeholder="e.g. Sgt, Capt, Spc"
                                    value={newTrainee.rank}
                                    onChange={(e) => setNewTrainee({ ...newTrainee, rank: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-color)' }}
                                    required
                                />
                            </label>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                First Name:
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newTrainee.first_name}
                                    onChange={(e) => setNewTrainee({ ...newTrainee, first_name: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-color)' }}
                                    required
                                />
                            </label>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                Last Name:
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newTrainee.last_name}
                                    onChange={(e) => setNewTrainee({ ...newTrainee, last_name: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--panel-bg)', color: 'var(--text-color)' }}
                                    required
                                />
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ backgroundColor: '#215b93', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    Add Trainee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EvaluatorHome