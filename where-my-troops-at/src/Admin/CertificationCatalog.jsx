import { useState, useEffect } from 'react';
import { SERVER_URL } from '../utils/api';

function CertificationCatalog() {
  const [certifications, setCertifications] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${SERVER_URL}/certs`)
      .then((res) => res.json())
      .then((data) => {
        setCertifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCertifications = certifications.filter((cert) =>
    cert.name?.toLowerCase().includes(query.toLowerCase()),
  );

  const openCreateForm = () => {
    setEditingId(null);
    setName('');
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (cert) => {
    setEditingId(cert.id);
    setName(cert.name);
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `${SERVER_URL}/certs/${editingId}`
        : `${SERVER_URL}/certs`;

      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save certification.');
      }

      setCertifications((prev) =>
        editingId
          ? prev.map((c) => (c.id === data.id ? data : c))
          : [...prev, data],
      );

      setIsFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cert) => {
    if (!window.confirm(`Delete the certification "${cert.name}"?`)) return;

    try {
      const res = await fetch(`${SERVER_URL}/certs/${cert.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete certification.');

      setCertifications((prev) => prev.filter((c) => c.id !== cert.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="cert-catalog" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ marginTop: '0px' }}>Certification Catalog</h2>
        <button className="new-btn" onClick={openCreateForm}>
          + New Certification
        </button>
      </div>
      <input
        type="text"
        className="cert-search"
        placeholder="Search by certification."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p>Loading certifications...</p>
      ) : (
        <ul className="cert-results">
          {filteredCertifications.length === 0 ? (
            <li>No certifications found.</li>
          ) : (
            filteredCertifications.map((cert) => (
              <li
                key={cert.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '5px 0',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                <span>{cert.name}</span>
                <span style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button
                    className="btn-edit"
                    onClick={() => openEditForm(cert)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(cert)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))
          )}
        </ul>
      )}

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
              maxWidth: '400px',
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
              {editingId ? 'Edit Certification' : 'New Certification'}
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
                placeholder="Certification name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              />

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
                  disabled={isSaving}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    backgroundColor: '#215b93',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  {isSaving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificationCatalog;
