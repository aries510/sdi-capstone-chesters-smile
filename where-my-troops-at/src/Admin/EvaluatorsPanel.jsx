import { useState } from 'react';
import { SERVER_URL } from '../utils/api';

export default function EvaluatorsPanel({ evaluators, trainees, onEvaluatorAdded, onEvaluatorRemoved }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTraineeId, setSelectedTraineeId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const updateRole = async (personnel, role) => {
        const res = await fetch(`${SERVER_URL}/personnel/${personnel.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rank: personnel.rank,
                first_name: personnel.first_name,
                last_name: personnel.last_name,
                role,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(capitalize(data.error || `Failed to set role to ${role}`));
        }

        return data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedTraineeId) {
            setError('Select a trainee to promote.');
            return;
        }

        const trainee = trainees.find(
            (t) => Number(t.id) === Number(selectedTraineeId),
        );
        if (!trainee) {
            setError('Selected trainee could not be found.');
            return;
        }

        setIsLoading(true);

        try {
            const updated = await updateRole(trainee, 'evaluator');
            onEvaluatorAdded(updated);
            setSelectedTraineeId('');
            setIsFormOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (evaluator) => {
        try {
            const updated = await updateRole(evaluator, 'trainee');
            onEvaluatorRemoved(updated);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="panel" style={{ position: 'relative' }}>
            <div className="panel-header">
                <h3>Trainee Management</h3>
                <button className="new-btn" onClick={() => setIsFormOpen(true)}>Promote New Evaluator</button>
            </div>

            <ul className="panel-list">
                {evaluators.map(evaluator => (
                    <li key={evaluator.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span>{evaluator.rank} {evaluator.first_name} {evaluator.last_name}</span>
                        <button
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                            onClick={() => handleRemove(evaluator)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
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
                            Promote Trainee to Evaluator
                        </h4>

                        {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <select
                                value={selectedTraineeId}
                                onChange={(e) => setSelectedTraineeId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="" disabled>Select a trainee</option>
                                {trainees.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.rank} {t.first_name} {t.last_name}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#215b93', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    {isLoading ? 'Promoting...' : 'Promote'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
