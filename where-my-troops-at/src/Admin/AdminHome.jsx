import { useState, useEffect } from 'react';
import './AdminHome.css';
import EvaluatorsPanel from './EvaluatorsPanel';
import AccountManagementPanel from './AccountManagementPanel';
import CrewRolePanel from './CrewRolePanel';
import WeaponSystemPanel from './WeaponSystemPanel';
import CrewCertificationPanel from './CrewCertificationPanel';
import CertQualRenewalPanel from './CertQualRenewalPanel';
import CertificationCatalog from './CertificationCatalog';
import TraineeModal from '../components/TraineeModal';
// Added global 'SERVER_URL' in utils>api.js. Should make production conversion easier - Jacob
import { SERVER_URL as API_BASE } from '../utils/api';

function AdminHome() {
  const [personnel, setPersonnel] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [weaponSystems, setWeaponSystems] = useState([]);
  const [crewRoles, setCrewRoles] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const [isPersonnelFormOpen, setIsPersonnelFormOpen] = useState(false);
  const [editingPersonnelId, setEditingPersonnelId] = useState(null);
  const [personnelForm, setPersonnelForm] = useState({
    rank: '',
    first_name: '',
    last_name: '',
    role: 'trainee',
  });
  const [personnelFormError, setPersonnelFormError] = useState('');
  const [isPersonnelSaving, setIsPersonnelSaving] = useState(false);

  const evaluators = personnel.filter((p) => p.role === 'evaluator');
  const trainees = personnel.filter((p) => p.role === 'trainee');
  const planners = personnel.filter((p) => p.role === 'planner');

  const fetchQuals = () => {
    fetch(`${API_BASE}/quals`)
      .then((res) => res.json())
      .then(setQualifications)
      .catch(console.error);
  };

  useEffect(() => {
    fetch(`${API_BASE}/personnel`)
      .then((res) => res.json())
      .then(setPersonnel)
      .catch(console.error);

    fetchQuals();

    fetch(`${API_BASE}/weaponsystems`)
      .then((res) => res.json())
      .then(setWeaponSystems)
      .catch(console.error);

    fetch(`${API_BASE}/crewroles`)
      .then((res) => res.json())
      .then(setCrewRoles)
      .catch(console.error);

    fetch(`${API_BASE}/certs`)
      .then((res) => res.json())
      .then(setCertifications)
      .catch(console.error);
  }, []);

  const openCreatePersonnel = () => {
    setEditingPersonnelId(null);
    setPersonnelForm({
      rank: '',
      first_name: '',
      last_name: '',
      role: 'trainee',
    });
    setPersonnelFormError('');
    setIsPersonnelFormOpen(true);
  };

  const openEditPersonnel = (person, e) => {
    e.stopPropagation();
    setEditingPersonnelId(person.id);
    setPersonnelForm({
      rank: person.rank,
      first_name: person.first_name,
      last_name: person.last_name,
      role: person.role,
    });
    setPersonnelFormError('');
    setIsPersonnelFormOpen(true);
  };

  const handlePersonnelSubmit = async (e) => {
    e.preventDefault();
    setPersonnelFormError('');

    const { rank, first_name, last_name, role } = personnelForm;
    if (!rank || !first_name || !last_name) {
      setPersonnelFormError('Rank, first name, and last name are required.');
      return;
    }

    setIsPersonnelSaving(true);

    try {
      const url = editingPersonnelId
        ? `${API_BASE}/personnel/${editingPersonnelId}`
        : `${API_BASE}/personnel`;

      const res = await fetch(url, {
        method: editingPersonnelId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank, first_name, last_name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save personnel record.');
      }

      setPersonnel((prev) =>
        editingPersonnelId
          ? prev.map((p) => (p.id === data.id ? data : p))
          : [...prev, data],
      );

      setIsPersonnelFormOpen(false);
    } catch (err) {
      setPersonnelFormError(err.message);
    } finally {
      setIsPersonnelSaving(false);
    }
  };

  const handleDeletePersonnel = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        'Are you sure you want to remove this person from the unit?',
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/personnel/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete personnel record.');

      setPersonnel((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-container">
        <div className="top-row">
          <div className="eval-trainee-list" style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3>Personnel</h3>
              <button className="new-btn" onClick={openCreatePersonnel}>
                + Add Personnel
              </button>
            </div>
            <p className="eval-trainee-subtitle">Click name to view details</p>

            <div className="eval-trainee-scroll">
              <div className="personnel-group">
                <h4 className="group-title title-evaluator">Evaluators</h4>
                {evaluators.length === 0 ? (
                  <p className="no-records-msg">No evaluators found.</p>
                ) : (
                  <ul className="personnel-list">
                    {evaluators.map((ev) => (
                      <li
                        key={ev.id}
                        className="personnel-item"
                        onClick={() =>
                          setSelectedDetails({
                            type: 'Evaluator',
                            ...ev,
                          })
                        }
                      >
                        <span>
                          {ev.rank} {ev.first_name} {ev.last_name}
                        </span>
                        <div className="trainee-item-actions">
                          <span className="badge badge-evaluator">
                            Evaluator
                          </span>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => openEditPersonnel(ev, e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => handleDeletePersonnel(ev.id, e)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="personnel-group">
                <h4 className="group-title title-planner">Planners</h4>
                {planners.length === 0 ? (
                  <p className="no-records-msg">No planners found.</p>
                ) : (
                  <ul className="personnel-list">
                    {planners.map((pl) => (
                      <li
                        key={pl.id}
                        className="personnel-item"
                        onClick={() =>
                          setSelectedDetails({
                            type: 'Planner',
                            ...pl,
                          })
                        }
                      >
                        <span>
                          {pl.rank} {pl.first_name} {pl.last_name}
                        </span>
                        <div className="trainee-item-actions">
                          <span className="badge badge-planner">Planner</span>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => openEditPersonnel(pl, e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => handleDeletePersonnel(pl.id, e)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="personnel-group">
                <h4 className="group-title title-trainee">Trainees</h4>
                {trainees.length === 0 ? (
                  <p className="no-records-msg">No trainees found.</p>
                ) : (
                  <ul className="personnel-list">
                    {trainees.map((t) => (
                      <li
                        key={t.id}
                        className="personnel-item"
                        onClick={() => setSelectedTrainee(t)}
                      >
                        <span>
                          {t.rank} {t.first_name} {t.last_name}
                        </span>
                        <div className="trainee-item-actions">
                          <span className="badge badge-trainee">Trainee</span>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => openEditPersonnel(t, e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete-trainee"
                            onClick={(e) => handleDeletePersonnel(t.id, e)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {isPersonnelFormOpen && (
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
                    {editingPersonnelId ? 'Edit Personnel' : 'Add Personnel'}
                  </h4>

                  {personnelFormError && (
                    <div
                      style={{
                        color: '#dc2626',
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {personnelFormError}
                    </div>
                  )}

                  <form
                    onSubmit={handlePersonnelSubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Rank"
                        value={personnelForm.rank}
                        onChange={(e) =>
                          setPersonnelForm((f) => ({
                            ...f,
                            rank: e.target.value,
                          }))
                        }
                        required
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="First Name"
                        value={personnelForm.first_name}
                        onChange={(e) =>
                          setPersonnelForm((f) => ({
                            ...f,
                            first_name: e.target.value,
                          }))
                        }
                        required
                        style={{
                          flex: 2,
                          minWidth: 0,
                          padding: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={personnelForm.last_name}
                        onChange={(e) =>
                          setPersonnelForm((f) => ({
                            ...f,
                            last_name: e.target.value,
                          }))
                        }
                        required
                        style={{
                          flex: 2,
                          minWidth: 0,
                          padding: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <select
                      value={personnelForm.role}
                      onChange={(e) =>
                        setPersonnelForm((f) => ({
                          ...f,
                          role: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="trainee">Trainee</option>
                      <option value="evaluator">Evaluator</option>
                      <option value="planner">Planner</option>
                    </select>

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
                        onClick={() => setIsPersonnelFormOpen(false)}
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
                        disabled={isPersonnelSaving}
                        style={{
                          padding: '6px 12px',
                          cursor: 'pointer',
                          backgroundColor: '#215b93',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                        }}
                      >
                        {isPersonnelSaving
                          ? 'Saving...'
                          : editingPersonnelId
                            ? 'Save Changes'
                            : 'Create Record'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* <div className="admin-actions">
            <div className="upload-button">UPLOAD DOCUMENT</div>
            <div className="import-button">+ BULK IMPORT PDF/CSV</div>
          </div> */}
        </div>

        <div className="admin-panels">
          <EvaluatorsPanel
            evaluators={evaluators}
            trainees={trainees}
            onEvaluatorAdded={(promoted) =>
              setPersonnel((prev) =>
                prev.map((p) => (p.id === promoted.id ? promoted : p)),
              )
            }
            onEvaluatorRemoved={(demoted) =>
              setPersonnel((prev) =>
                prev.map((p) => (p.id === demoted.id ? demoted : p)),
              )
            }
          />
          <AccountManagementPanel />
          <CrewRolePanel />
          <WeaponSystemPanel />
          <div className="catalog-wrapper">
            <CertificationCatalog />
          </div>
          <CrewCertificationPanel />
          {/* <CertQualRenewalPanel /> */}
        </div>

        {/* Trainee Modal for qualifications/training */}
        {selectedTrainee && (
          <TraineeModal
            trainee={selectedTrainee}
            weaponSystems={weaponSystems}
            crewRoles={crewRoles}
            certifications={certifications}
            onClose={() => setSelectedTrainee(null)}
            onQualAdded={fetchQuals}
          />
        )}

        {/* Evaluator generic details modal */}
        {selectedDetails && (
          <div className="modal-overlay blur-bg">
            <div className="details-modal">
              <div className="details-modal-header">
                <h3>{selectedDetails.type} Details</h3>
                <button
                  className="close-icon-btn"
                  onClick={() => setSelectedDetails(null)}
                >
                  &times;
                </button>
              </div>

              <ul className="details-list">
                {Object.entries(selectedDetails)
                  .filter(([key]) => key !== 'type' && key !== 'pw_hash')
                  .map(([key, value]) => (
                    <li key={key} className="details-item">
                      <strong className="details-label">
                        {key.replace(/_/g, ' ')}:
                      </strong>
                      <span className="details-value">
                        {typeof value === 'boolean'
                          ? value
                            ? 'True'
                            : 'False'
                          : String(value ?? 'N/A')}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="details-modal-actions">
                <button
                  className="btn-close"
                  onClick={() => setSelectedDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default AdminHome;
