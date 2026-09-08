import { useState } from "react";

function EvaluatorsPanel({
    evaluators = [],
    trainees = [],
    onEvaluatorAdded,
    onEvaluatorUpdated
}) {
    // --- New / Promote State ---
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addMode, setAddMode] = useState("create"); // "create" or "promote"

    // Create state
    const [createUsername, setCreateUsername] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createError, setCreateError] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    // Promote state
    const [selectedTraineeId, setSelectedTraineeId] = useState("");
    const [promoteError, setPromoteError] = useState("");
    const [promoteLoading, setPromoteLoading] = useState(false);

    // --- Edit State ---
    const [editingId, setEditingId] = useState(null);
    const [editAdmin, setEditAdmin] = useState(false);
    const [editEvaluator, setEditEvaluator] = useState(true);
    const [editPlanner, setEditPlanner] = useState(false);
    const [editPassword, setEditPassword] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // Filter trainees who aren't already evaluators
    const eligibleTrainees = trainees.filter(t => !t.is_evaluator);

    // 1. Create Brand New Evaluator (POST /users)
    const handleCreateEvaluator = async (e) => {
        e.preventDefault();
        setCreateError("");

        if (!createUsername || !createPassword) {
            setCreateError("Username and password are required.");
            return;
        }

        setCreateLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8080/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: createUsername,
                    password: createPassword,
                    is_evaluator: true
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create evaluator');

            setCreateUsername("");
            setCreatePassword("");
            setShowAddMenu(false);

            if (onEvaluatorAdded) onEvaluatorAdded(data);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    // 2. Promote Existing Trainee to Evaluator (PATCH /users/:id)
    const handlePromoteTrainee = async (e) => {
        e.preventDefault();
        setPromoteError("");

        if (!selectedTraineeId) {
            setPromoteError("Please select a user to promote.");
            return;
        }

        setPromoteLoading(true);

        try {
            const res = await fetch(`http://127.0.0.1:8080/users/${selectedTraineeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_evaluator: true })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to promote user');

            setSelectedTraineeId("");
            setShowAddMenu(false);

            if (onEvaluatorUpdated) onEvaluatorUpdated(data);
        } catch (err) {
            setPromoteError(err.message);
        } finally {
            setPromoteLoading(false);
        }
    };

    // 3. Edit Existing Evaluator (PATCH /users/:id)
    const startEdit = (evaluator) => {
        setEditingId(evaluator.id);
        setEditAdmin(!!evaluator.is_admin);
        setEditEvaluator(!!evaluator.is_evaluator);
        setEditPlanner(!!evaluator.is_planner);
        setEditPassword("");
        setEditError("");
    };

    const handleSaveEdit = async (id) => {
        setEditError("");
        setEditLoading(true);

        const updatePayload = {
            is_admin: editAdmin,
            is_evaluator: editEvaluator,
            is_planner: editPlanner,
        };

        if (editPassword.trim()) {
            updatePayload.pw_hash = editPassword;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8080/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update user');

            setEditingId(null);

            if (onEvaluatorUpdated) onEvaluatorUpdated(data);
        } catch (err) {
            setEditError(err.message);
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>Evaluators:</h3>
                <button
                    className="new-btn"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                >
                    {showAddMenu ? 'Cancel' : '+ New / Add'}
                </button>
            </div>

            {/* Add / Promote Section */}
            {showAddMenu && (
                <div style={{
                    marginBottom: '15px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--list-bg)'
                }}>
                    {/* Mode Toggle Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                            type="button"
                            className="new-btn"
                            style={{ opacity: addMode === 'create' ? 1 : 0.6 }}
                            onClick={() => setAddMode('create')}
                        >
                            Create New User
                        </button>
                        <button
                            type="button"
                            className="new-btn"
                            style={{ opacity: addMode === 'promote' ? 1 : 0.6 }}
                            onClick={() => setAddMode('promote')}
                        >
                            Promote Trainee
                        </button>
                    </div>

                    {/* Mode A: Create New User */}
                    {addMode === 'create' && (
                        <form onSubmit={handleCreateEvaluator} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Create New Evaluator</h4>
                            {createError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{createError}</p>}
                            <input
                                type="text"
                                placeholder="Username"
                                value={createUsername}
                                onChange={(e) => setCreateUsername(e.target.value)}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                            <button type="submit" disabled={createLoading} className="new-btn">
                                {createLoading ? 'Saving...' : 'Create Evaluator'}
                            </button>
                        </form>
                    )}

                    {/* Mode B: Promote Existing Trainee */}
                    {addMode === 'promote' && (
                        <form onSubmit={handlePromoteTrainee} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Promote Trainee to Evaluator</h4>
                            {promoteError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{promoteError}</p>}
                            <select
                                value={selectedTraineeId}
                                onChange={(e) => setSelectedTraineeId(e.target.value)}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select a trainee...</option>
                                {eligibleTrainees.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.username || `${t.first_name || ''} ${t.last_name || ''}`.trim() || `User #${t.id}`}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" disabled={promoteLoading || !selectedTraineeId} className="new-btn">
                                {promoteLoading ? 'Promoting...' : 'Make Evaluator'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Evaluators List */}
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {evaluators.map(e => (
                    <li key={e.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        {editingId === e.id ? (
                            /* Edit Form */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', backgroundColor: 'var(--list-bg)', borderRadius: '4px' }}>
                                <strong>Editing: {e.username}</strong>
                                {editError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{editError}</p>}

                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editEvaluator}
                                            onChange={(opt) => setEditEvaluator(opt.target.checked)}
                                        /> Evaluator
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editAdmin}
                                            onChange={(opt) => setEditAdmin(opt.target.checked)}
                                        /> Admin
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editPlanner}
                                            onChange={(opt) => setEditPlanner(opt.target.checked)}
                                        /> Planner
                                    </label>
                                </div>

                                <input
                                    type="password"
                                    placeholder="Reset Password (optional)"
                                    value={editPassword}
                                    onChange={(opt) => setEditPassword(opt.target.value)}
                                    style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleSaveEdit(e.id)} disabled={editLoading} className="new-btn">
                                        {editLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="new-btn">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Normal View */
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{e.username} | Training Quals | Trainees</span>
                                <button className="new-btn" onClick={() => startEdit(e)}>Edit</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EvaluatorsPanel;