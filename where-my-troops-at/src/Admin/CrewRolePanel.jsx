import { useState } from 'react';
import { SERVER_URL } from '../utils/api';

const emptyForm = { name: '', description: '' };

export default function CrewRolePanel({ roles, setRoles }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setIsFormOpen(true);
    };

    const openEditForm = (role) => {
        setEditingId(role.id);
        setForm({ name: role.name, description: role.description ?? '' });
        setError('');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) {
            setError('Name is required.');
            return;
        }

        setIsLoading(true);

        try {
            const url = editingId
                ? `${SERVER_URL}/crewroles/${editingId}`
                : `${SERVER_URL}/crewroles`;

            const body = editingId
                ? { name: form.name.trim(), description: form.description }
                : { role: form.name.trim(), description: form.description };

            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(capitalize(data.error || 'Failed to save crew role.'));
            }

            setRoles((prev) =>
                editingId ? prev.map((r) => (r.id === data.id ? data : r)) : [...prev, data],
            );

            setIsFormOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Delete the crew role "${role.name}"?`)) return;

        try {
            const res = await fetch(`${SERVER_URL}/crewroles/${role.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete crew role.');

            setRoles((prev) => prev.filter((r) => r.id !== role.id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="panel" style={{ position: 'relative' }}>
            <div className="panel-header">
                <h3>Crew Role Management</h3>
                <button className="new-btn" onClick={openCreateForm}>+ New Role</button>
            </div>

            <ul className="panel-list">
                {roles.map((role) => (
                    <li key={role.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                            <div>{role.name}</div>
                            {role.description && (
                                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{role.description}</div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button
                                className="btn-edit"
                                onClick={() => openEditForm(role)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn-delete"
                                onClick={() => handleDelete(role)}
                            >
                                Delete
                            </button>
                        </div>
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
                            {editingId ? 'Edit Crew Role' : 'New Crew Role'}
                        </h4>

                        {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Role name"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical', font: 'inherit' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#215b93', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    {isLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
