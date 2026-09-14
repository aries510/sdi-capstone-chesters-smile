import { useEffect, useState } from 'react';
import { SERVER_URL } from '../utils/api';

const emptyForm = {
  username: '',
  password: '',
  is_admin: false,
  is_evaluator: false,
  is_planner: false,
  personnel_id: '',
};

export default function AccountManagementPanel() {
  const [accounts, setAccounts] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    fetch(`${SERVER_URL}/users`)
      .then((res) => res.json())
      .then(setAccounts)
      .catch(console.error);

    fetch(`${SERVER_URL}/personnel`)
      .then((res) => res.json())
      .then(setPersonnel)
      .catch(console.error);
  }, []);

  const personnelName = (personnelId) => {
    const person = personnel.find((p) => Number(p.id) === Number(personnelId));
    return person
      ? `${person.rank} ${person.first_name} ${person.last_name}`
      : null;
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (account) => {
    setEditingId(account.id);
    setForm({
      username: account.username,
      password: '',
      is_admin: !!account.is_admin,
      is_evaluator: !!account.is_evaluator,
      is_planner: !!account.is_planner,
      personnel_id: account.personnel_id ?? '',
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editingId && (!form.username || !form.password)) {
      setError('Username and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      let res, data;

      if (editingId) {
        const body = {
          is_admin: form.is_admin,
          is_evaluator: form.is_evaluator,
          is_planner: form.is_planner,
          personnel_id:
            form.personnel_id === '' ? null : Number(form.personnel_id),
        };
        if (form.password) body.pw_hash = form.password;

        res = await fetch(`${SERVER_URL}/users/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${SERVER_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
            is_admin: form.is_admin,
            is_evaluator: form.is_evaluator,
            is_planner: form.is_planner,
            personnel_id:
              form.personnel_id === '' ? null : Number(form.personnel_id),
          }),
        });
      }

      data = await res.json();

      if (!res.ok) {
        throw new Error(capitalize(data.error || 'Failed to save account.'));
      }

      if (editingId) {
        setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      } else {
        setAccounts((prev) => [...prev, data]);
      }

      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete the account "${account.username}"?`)) return;

    try {
      const res = await fetch(`${SERVER_URL}/users/${account.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account.');

      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <div className="panel-header">
        <h3>Account Management</h3>
        <button className="new-btn" onClick={openCreateForm}>
          + New Account
        </button>
      </div>

      <ul className="panel-list">
        {accounts.map((account) => (
          <li
            key={account.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div>{account.username}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                {[
                  account.is_admin && 'Admin',
                  account.is_evaluator && 'Evaluator',
                  account.is_planner && 'Planner',
                ]
                  .filter(Boolean)
                  .join(', ') || 'General User'}
                {account.personnel_id != null &&
                  ` · ${personnelName(account.personnel_id) ?? `Personnel #${account.personnel_id}`}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => openEditForm(account)}
              >
                Edit
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
                onClick={() => handleDelete(account)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isFormOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--panel-bg)',
              padding: '20px',
              borderRadius: '6px',
              width: '85%',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              color: 'var(--text-color)',
            }}
          >
            <h4
              style={{
                marginTop: 0,
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '10px',
              }}
            >
              {editingId ? 'Edit Account' : 'Create Account'}
            </h4>

            {error && (
              <div
                style={{
                  color: '#dc2626',
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                disabled={!!editingId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder={
                  editingId
                    ? 'New Password (leave blank to keep current)'
                    : 'Password'
                }
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required={!editingId}
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              />

              <select
                value={form.personnel_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, personnel_id: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">No linked personnel</option>
                {[...personnel]
                  .sort((a, b) => a.last_name.localeCompare(b.last_name))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.first_name} {p.last_name} ({p.role})
                    </option>
                  ))}
              </select>

              <div style={{ display: 'flex', gap: '15px' }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_admin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_admin: e.target.checked }))
                    }
                  />
                  Admin
                </label>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_evaluator}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_evaluator: e.target.checked }))
                    }
                  />
                  Evaluator
                </label>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_planner}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_planner: e.target.checked }))
                    }
                  />
                  Planner
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    backgroundColor: '#215b93',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  {isLoading
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
