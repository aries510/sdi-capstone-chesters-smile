import { useEffect, useState } from 'react';
import { SERVER_URL } from '../utils/api';

const emptyForm = { name: '', acronym: '', description: '', domain: '' };

export default function WeaponSystemPanel() {
    const [systems, setSystems] = useState([]);
    const [domains, setDomains] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    useEffect(() => {
        fetch(`${SERVER_URL}/weaponsystems`)
            .then((res) => res.json())
            .then(setSystems)
            .catch(console.error);

        fetch(`${SERVER_URL}/domains`)
            .then((res) => res.json())
            .then(setDomains)
            .catch(console.error);
    }, []);

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ ...emptyForm, domain: domains[0]?.name ?? '' });
        setError('');
        setIsFormOpen(true);
    };

    const openEditForm = (system) => {
        setEditingId(system.id);
        setForm({
            name: system.name,
            acronym: system.acronym ?? '',
            description: system.description ?? '',
            domain: system.domain,
        });
        setError('');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim() || !form.description.trim() || !form.domain) {
            setError('Name, description, and domain are required.');
            return;
        }

        setIsLoading(true);

        try {
            const url = editingId
                ? `${SERVER_URL}/weaponsystems/${editingId}`
                : `${SERVER_URL}/weaponsystems`;

            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    acronym: form.acronym.trim(),
                    description: form.description.trim(),
                    domain: form.domain,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(capitalize(data.error || 'Failed to save weapon system.'));
            }

            if (editingId) {
                const updated = { id: editingId, ...form };
                setSystems((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
            } else {
                setSystems((prev) => [...prev, data]);
            }

            setIsFormOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (system) => {
        if (!window.confirm(`Delete the weapon system "${system.name}"?`)) return;

        try {
            const res = await fetch(`${SERVER_URL}/weaponsystems/${system.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete weapon system.');

            setSystems((prev) => prev.filter((s) => s.id !== system.id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="panel" style={{ position: 'relative' }}>
            <div className="panel-header">
                <h3>Weapon System Management</h3>
                <button className="new-btn" onClick={openCreateForm}>+ New Weapon System</button>
            </div>

            <ul className="panel-list">
                {systems.map((system) => (
                    <li key={system.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                            <div>
                                {system.name}
                                {system.acronym && ` (${system.acronym})`}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                                {system.domain}
                                {system.description && ` · ${system.description}`}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button
                                style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => openEditForm(system)}
                            >
                                Edit
                            </button>
                            <button
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                                onClick={() => handleDelete(system)}
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
                            {editingId ? 'Edit Weapon System' : 'New Weapon System'}
                        </h4>

                        {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    required
                                    style={{ flex: 2, minWidth: 0, padding: '8px', boxSizing: 'border-box' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Acronym"
                                    value={form.acronym}
                                    onChange={(e) => setForm((f) => ({ ...f, acronym: e.target.value }))}
                                    style={{ flex: 1, minWidth: 0, padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <select
                                value={form.domain}
                                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="" disabled>Select a domain</option>
                                {domains.map((d) => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical', font: 'inherit' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#215b93', color: 'white', border: 'none', borderRadius: '4px' }}>
                                    {isLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create System'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
