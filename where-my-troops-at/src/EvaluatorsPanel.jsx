import { useState } from "react";

function EvaluatorsPanel({
    evaluators = [],
    standardUsers = [],
    trainees = [],
    onEvaluatorAdded,
    onEvaluatorUpdated,
    onEvaluatorDeleted
}) {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addMode, setAddMode] = useState("create");

    const [createUsername, setCreateUsername] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createError, setCreateError] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    // Selected entity can be 'user:12' or 'trainee:45'
    const [selectedTarget, setSelectedTarget] = useState("");
    const [promotePassword, setPromotePassword] = useState("");
    const [promoteUsername, setPromoteUsername] = useState("");
    const [promoteError, setPromoteError] = useState("");
    const [promoteLoading, setPromoteLoading] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editAdmin, setEditAdmin] = useState(false);
    const [editEvaluator, setEditEvaluator] = useState(true);
    const [editPlanner, setEditPlanner] = useState(false);
    const [editPassword, setEditPassword] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

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

    const handlePromote = async (e) => {
        e.preventDefault();
        setPromoteError("");

        if (!selectedTarget) {
            setPromoteError("Please select a user or trainee to promote.");
            return;
        }

        const [type, id] = selectedTarget.split(":");
        setPromoteLoading(true);

        try {
            if (type === "user") {
                // Promoting existing standard user account
                const res = await fetch(`http://127.0.0.1:8080/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_evaluator: true })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to promote user');

                const updatedUser = Array.isArray(data) ? data[0] : (data.user || data);
                if (onEvaluatorUpdated) onEvaluatorUpdated(updatedUser);

            } else if (type === "trainee") {
                // Creating a login account for a trainee to become an evaluator
                if (!promoteUsername || !promotePassword) {
                    throw new Error("Username and password are required to create an evaluator account for this trainee.");
                }

                const res = await fetch('http://127.0.0.1:8080/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: promoteUsername,
                        password: promotePassword,
                        is_evaluator: true,
                        personnel_id: Number(id)
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create evaluator account');

                if (onEvaluatorAdded) onEvaluatorAdded(data);
            }

            setSelectedTarget("");
            setPromoteUsername("");
            setPromotePassword("");
            setShowAddMenu(false);

        } catch (err) {
            setPromoteError(err.message);
        } finally {
            setPromoteLoading(false);
        }
    };

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

    const handleDeleteEvaluator = async (id) => {
        if (!window.confirm("Are you sure you want to delete this evaluator account?")) return;

        try {
            const res = await fetch(`http://127.0.0.1:8080/users/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete user');

            if (onEvaluatorDeleted) onEvaluatorDeleted(id);
        } catch (err) {
            alert(err.message);
        }
    };

    const isSelectingTrainee = selectedTarget.startsWith("trainee:");

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

            {showAddMenu && (
                <div style={{
                    marginBottom: '15px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--list-bg)'
                }}>
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
                            Promote User / Trainee
                        </button>
                    </div>

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

                    {addMode === 'promote' && (
                        <form onSubmit={handlePromote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Promote to Evaluator</h4>
                            {promoteError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{promoteError}</p>}

                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select a user or trainee...</option>
                                {standardUsers.length > 0 && (
                                    <optgroup label="Standard Users">
                                        {standardUsers.map(u => (
                                            <option key={`user-${u.id}`} value={`user:${u.id}`}>
                                                {u.username}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                {trainees.length > 0 && (
                                    <optgroup label="Trainees / Personnel">
                                        {trainees.map(t => (
                                            <option key={`trainee-${t.id}`} value={`trainee:${t.id}`}>
                                                {t.rank ? `${t.rank} ` : ''}{t.first_name} {t.last_name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>

                            {isSelectingTrainee && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Assign Username for Evaluator account"
                                        value={promoteUsername}
                                        onChange={(e) => setPromoteUsername(e.target.value)}
                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Assign Password"
                                        value={promotePassword}
                                        onChange={(e) => setPromotePassword(e.target.value)}
                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </>
                            )}

                            <button type="submit" disabled={promoteLoading || !selectedTarget} className="new-btn">
                                {promoteLoading ? 'Promoting...' : 'Make Evaluator'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {evaluators.map(e => (
                    <li key={e.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        {editingId === e.id ? (
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{e.username} | Training Quals | Trainees</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="new-btn" onClick={() => startEdit(e)}>Edit</button>
                                    <button
                                        className="new-btn"
                                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                                        onClick={() => handleDeleteEvaluator(e.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EvaluatorsPanel;