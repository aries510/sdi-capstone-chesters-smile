import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TraineeModal from '../components/TraineeModal';
import './EvaluatorHome.css';
// Added global 'SERVER_URL' in utils>api.js. Should make production conversion easier - Jacob
import { SERVER_URL as API_BASE } from '../utils/api';
import CertStatus from '../Admin/CertQualRenewalPanel';

function EvaluatorHome() {
  const [trainees, setTrainees] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [personnelCerts, setPersonnelCerts] = useState([]);
  const [weaponSystems, setWeaponSystems] = useState([]);
  const [crewRoles, setCrewRoles] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCert, setSelectedCert] = useState('Any');
  const [selectedCertification, setSelectedCertification] = useState('Any');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainee, setNewTrainee] = useState({
    first_name: '',
    last_name: '',
    rank: '',
  });

  // Mission staffing (read-only summary; editing happens in MPC)
  const [missions, setMissions] = useState([]);

  const fetchTrainees = () => {
    fetch(`${API_BASE}/personnel`)
      .then((res) => res.json())
      .then(setTrainees)
      .catch(console.error);
  };

  const fetchQualifications = () => {
    fetch(`${API_BASE}/quals`)
      .then((res) => res.json())
      .then(setQualifications)
      .catch(console.error);
  };

  const fetchPersonnelCerts = () => {
    fetch(`${API_BASE}/perscerts`)
      .then((res) => res.json())
      .then(setPersonnelCerts)
      .catch(console.error);
  };

  const fetchMissions = () => {
    fetch(`${API_BASE}/msnplans`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((m) => ({
          id: m.id,
          name: m.msn_name,
          type: m.msn_type,
          startDate: m.start_date,
          endDate: m.end_date,
          location: m.location,
          status: m.status,
          requiredPersonnel: m.num_personnel_req,
          personnel: Array.isArray(m.personnel) ? m.personnel : [],
          roles: Array.isArray(m.roles) ? m.roles : [],
        }));
        setMissions(mapped);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTrainees();
    fetchQualifications();
    fetchPersonnelCerts();
    fetchMissions();

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

  const getTraineeName = (t) =>
    `${t.first_name || ''} ${t.last_name || ''}`.trim();

  const getQualsForTrainee = (personnelId) => {
    const record = qualifications.find((q) => q.personId === personnelId);
    return record?.qualifications || [];
  };

  const getCertsForTrainee = (trainee) => {
    const name = getTraineeName(trainee).toLowerCase();
    const record = personnelCerts.find(
      (p) => (p.member || '').trim().toLowerCase() === name,
    );
    return record?.certifications || [];
  };

  const uniqueUnits = [
    'All',
    ...new Set(trainees.map((t) => t.unit).filter(Boolean)),
  ];
  const uniqueStatuses = [
    'All',
    ...new Set(trainees.map((t) => t.status).filter(Boolean)),
  ];

  const filteredTrainees = trainees.filter((t) => {
    const term = searchQuery.toLowerCase();
    const fullName = getTraineeName(t).toLowerCase();
    const quals = getQualsForTrainee(t.id);
    const certs = getCertsForTrainee(t);

    const matchesName =
      fullName.includes(term) || t.rank?.toLowerCase().includes(term);
    const matchesSystem = quals.some((q) =>
      (q.system || '').toLowerCase().includes(term),
    );
    const matchesCertName = certs.some((c) =>
      (c.certification || '').toLowerCase().includes(term),
    );
    const matchesSearch =
      term === '' || matchesName || matchesSystem || matchesCertName;

    const matchesUnit = selectedUnit === 'All' || t.unit === selectedUnit;
    const matchesStatus =
      selectedStatus === 'All' || t.status === selectedStatus;

    const matchesCert =
      selectedCert === 'Any' ||
      quals.some((q) => String(q.systemId) === String(selectedCert));

    const matchesCertification =
      selectedCertification === 'Any' ||
      certs.some((c) => String(c.certId) === String(selectedCertification));

    return (
      matchesSearch &&
      matchesUnit &&
      matchesStatus &&
      matchesCert &&
      matchesCertification
    );
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTrainee.first_name || !newTrainee.last_name || !newTrainee.rank) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrainee),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add trainee');
        return;
      }
      fetchTrainees();
      setShowAddModal(false);
      setNewTrainee({ first_name: '', last_name: '', rank: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="evaluator-container">
      {/* Search and Filters Section */}
      <div className="search-filter-row">
        <div className="search-filter-section">
          <div className="search-bar-container">
            <span className="search-label">SEARCH PERSONNEL</span>
            <input
              type="text"
              className="search-bar"
              placeholder="Name, Rank, Weapons System, or Certification"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-bar">
            <span>FILTERS</span>
            <div className="filter-row">
              <label>
                Unit:{' '}
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  {uniqueUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status:{' '}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Qualification:{' '}
                <select
                  value={selectedCert}
                  onChange={(e) => setSelectedCert(e.target.value)}
                >
                  <option value="Any">Any</option>
                  {weaponSystems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Certification:{' '}
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                >
                  <option value="Any">Any</option>
                  {certifications.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="evaluator-actions">
          <div className="upload-button">UPLOAD DOCUMENT</div>
          <div className="import-button">+ BULK IMPORT • PDF / CSV</div>
        </div>
      </div>

      {/* Trainees Panel */}
      <div className="evaluator-top-row">
        <div className="trainees-panel">
          <div className="trainees-header">
            <h3>Trainees</h3>
            <button
              className="add-new-btn"
              onClick={() => setShowAddModal(true)}
            >
              Add new
            </button>
          </div>

          <div className="trainees-list-header">
            <span>Name | Quals | Certs</span>
            <span>Add/edit/remove</span>
          </div>

          <ul className="trainees-list">
            {filteredTrainees.length === 0 ? (
              <li className="no-trainees-msg">No trainees found.</li>
            ) : (
              filteredTrainees.map((t) => {
                const quals = getQualsForTrainee(t.id);
                const certs = getCertsForTrainee(t);
                return (
                  <li key={t.id}>
                    <div className="trainee-row-info">
                      <strong>
                        {t.rank} {t.first_name} {t.last_name}
                      </strong>
                      <div className="trainee-line">
                        <span className="tag-label">
                          System Qualifications:
                        </span>
                        {quals.length > 0 ? (
                          quals.map((q) => (
                            <span
                              key={`${q.roleId}-${q.systemId}`}
                              className={`status-tag ${q.is_current ? 'status-current' : 'status-expired'}`}
                              title={`Qualified ${q.qualified_date}`}
                            >
                              {q.system}
                            </span>
                          ))
                        ) : (
                          <span className="tag-empty">No quals</span>
                        )}
                      </div>
                      <div className="trainee-line">
                        <span className="tag-label">Certifications:</span>
                        {certs.length > 0 ? (
                          certs.map((c) => (
                            <span
                              key={c.certId}
                              className={`status-tag ${c.is_current ? 'status-current' : 'status-expired'}`}
                              title={`Expires ${c.expiry_date}`}
                            >
                              {c.certification}
                            </span>
                          ))
                        ) : (
                          <span className="tag-empty">No certs</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn-edit"
                      onClick={() => setSelectedTrainee(t)}
                    >
                      Edit
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      {/* Upcoming certification/qualification renewals */}
      <div style={{ marginTop: '24px' }}>
        <CertStatus />
      </div>

      {/* Mission Staffing Panel: read-only summary of who's assigned where, links to MPC to edit */}
      <div className="trainees-panel" style={{ marginTop: '24px' }}>
        <div className="trainees-header">
          <h3>Mission Task Organization: Somethin' To Do</h3>
          <Link
            to="/MPC"
            className="add-new-btn"
            style={{ textDecoration: 'none' }}
          >
            Open Planning
          </Link>
        </div>

        {missions.length === 0 ? (
          <p style={{ fontSize: '0.85rem', opacity: 0.7, padding: '12px 4px' }}>
            No missions found.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {missions.map((m) => {
              const assignedCount = m.personnel.length;
              const openSlots = Math.max(
                (m.requiredPersonnel || 0) - assignedCount,
                0,
              );

              return (
                <li
                  key={m.id}
                  style={{
                    borderBottom: '1px solid var(--border-color, #334155)',
                    padding: '10px 4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong>{m.name}</strong>
                      <span style={{ opacity: 0.7 }}>
                        {' '}
                        — {m.location} — {m.startDate} to {m.endDate}
                      </span>

                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Assigned:{' '}
                        {assignedCount > 0
                          ? m.personnel.map((p) => p.name).join(', ')
                          : 'No one assigned yet'}
                      </div>

                      {m.roles.length > 0 && (
                        <div
                          style={{
                            fontSize: '0.85rem',
                            marginTop: '2px',
                            opacity: 0.85,
                          }}
                        >
                          Roles needed:{' '}
                          {m.roles
                            .map((r) => `${r.role} (${r.required})`)
                            .join(', ')}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: openSlots > 0 ? '#f59e0b' : '#22c55e',
                        }}
                      >
                        {openSlots > 0
                          ? `${openSlots} open slot${openSlots === 1 ? '' : 's'}`
                          : 'Fully staffed'}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {assignedCount} of {m.requiredPersonnel || 0} assigned
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Trainee Details / Qualification Modal */}
      {selectedTrainee && (
        <TraineeModal
          trainee={selectedTrainee}
          weaponSystems={weaponSystems}
          crewRoles={crewRoles}
          certifications={certifications}
          onClose={() => setSelectedTrainee(null)}
          onQualAdded={() => {
            fetchQualifications();
            fetchPersonnelCerts();
          }}
        />
      )}

      {/* Add New Trainee Form Modal */}
      {showAddModal && (
        <div className="modal-overlay blur-bg">
          <div className="add-trainee-modal">
            <div className="add-modal-header">
              <h3>Add New Trainee</h3>
              <button
                className="close-icon-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <form className="add-trainee-form" onSubmit={handleAddSubmit}>
              <label className="form-label">
                Rank:
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. TSgt, Capt, Spc"
                  value={newTrainee.rank}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, rank: e.target.value })
                  }
                  required
                />
              </label>

              <label className="form-label">
                First Name:
                <input
                  className="form-input"
                  type="text"
                  placeholder="First Name"
                  value={newTrainee.first_name}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, first_name: e.target.value })
                  }
                  required
                />
              </label>

              <label className="form-label">
                Last Name:
                <input
                  className="form-input"
                  type="text"
                  placeholder="Last Name"
                  value={newTrainee.last_name}
                  onChange={(e) =>
                    setNewTrainee({ ...newTrainee, last_name: e.target.value })
                  }
                  required
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Trainee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluatorHome;
