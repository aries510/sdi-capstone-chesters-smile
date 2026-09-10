import { useState } from 'react'

function TraineeModal({ trainee, quals, weaponSystems, getSystemName, onClose, onQualAdded }) {
    const [selectedSystemId, setSelectedSystemId] = useState('')

    const handleAddQual = async () => {
        if (!selectedSystemId) return

        try {
            const res = await fetch(`http://127.0.0.1:8080/quals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personnel_id: trainee.id,
                    system_id: Number(selectedSystemId),
                    qualified_date: new Date().toISOString().slice(0, 10),
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to add training')
                return
            }

            setSelectedSystemId('')
            onQualAdded()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--panel-bg, #1e293b)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-color, #334155)',
                    padding: '25px',
                    borderRadius: '8px',
                    width: '450px',
                    maxWidth: '90%',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: 'var(--text-color, #f8fafc)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Evaluator Trainee Modal</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-color, #fff)' }}>&times;</button>
                </div>

                <p className="modal-name" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>
                    {trainee.rank} {trainee.first_name} {trainee.last_name}
                </p>

                <div className="systems-training" style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Systems Training:</h4>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0', maxHeight: '150px', overflowY: 'auto' }}>
                        {quals.length === 0 ? (
                            <li style={{ fontSize: '0.9rem', opacity: 0.7 }}>No system qualifications found.</li>
                        ) : (
                            quals.map(q => (
                                <li key={q.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color, #334155)', fontSize: '0.9rem' }}>
                                    <strong>{getSystemName(q.system_id)}</strong> | Cert Date: {q.qualified_date}
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="add-training-row" style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={selectedSystemId}
                            onChange={(e) => setSelectedSystemId(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color, #334155)', background: 'transparent', color: 'var(--text-color, #fff)' }}
                        >
                            <option value="" style={{ color: '#000' }}>Select system...</option>
                            {weaponSystems.map(sys => (
                                <option key={sys.id} value={sys.id} style={{ color: '#000' }}>{sys.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddQual}
                            style={{ backgroundColor: '#215b93', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="modal-close-btn" onClick={onClose} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color, #334155)', color: 'var(--text-color, #fff)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TraineeModal