import { useState } from 'react';

export default function EvaluatorsPanel({ evaluators, standardUsers, trainees, onEvaluatorAdded, onEvaluatorDeleted }) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [rank, setRank] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!rank || !firstName || !lastName || !username || !password) {
            setError('All fields are required.');
            return;
        }

        setIsLoading(true);

        try {
            const personnelRes = await fetch('http://localhost:8080/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rank,
                    last_name: lastName,
                    first_name: firstName,
                    role: 'evaluator',
                }),
            });

            const personnelData = await personnelRes.json();

            if (!personnelRes.ok) {
                throw new Error(capitalize(personnelData.error || 'Failed to create personnel record'));
            }

            const userRes = await fetch('http://127.0.0.1:8080/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    is_evaluator: true,
                    is_admin: false,
                    is_planner: false,
                })
            });

            const userData = await userRes.json();

            if (!userRes.ok) {
                throw new Error('Failed to create user credentials.');
            }

            onEvaluatorAdded(userData);

            setRank('');
            setLastName('');
            setFirstName('');
            setUsername('');
            setPassword('');
            setIsFormOpen(false);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="panel" style={{ position: 'relative' }}>
            <div className="panel-header">
                <h3>Evaluator Management</h3>
                <button className="new-btn" onClick={() => setIsFormOpen(true)}>+ New Evaluator</button>
            </div>

            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                {evaluators.map(evaluator => (
                    <li key={evaluator.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span>{evaluator.username}</span>
                        <button
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                            onClick={() => onEvaluatorDeleted(evaluator.id)}
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
                            Add New Evaluator
                        </h4>

                        {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '8px', boxSizing: 'border-box' }} />
                                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ flex: 2, minWidth: 0, padding: '8px', boxSizing: 'border-box' }} />
                                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ flex: 2, minWidth: 0, padding: '8px', boxSizing: 'border-box' }} />
                            </div>

                            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            <input type="password" placeholder="Temporary Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#215b93', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    {isLoading ? 'Creating...' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}