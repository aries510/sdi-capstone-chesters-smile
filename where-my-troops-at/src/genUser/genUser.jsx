import './genUser.css';
import { useState, useEffect } from 'react';
// Added global 'SERVER_URL' in utils>api.js. Should make production conversion easier - Jacob
import { SERVER_URL, fetchCatch } from '../utils/api';





{/* // 1. Variables for production ---- */}
//#######################################################

//server routes
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const personnelId = storedUser.personnel_id || 1;

    const personnelUrl = `${SERVER_URL}/personnel/${personnelId}`;
    const certificationsUrl = `${SERVER_URL}/perscerts/${personnelId}`;
    const qualificationsUrl =`${SERVER_URL}/quals/${personnelId}`;





    

{/* // 2.1 GenUser ---- */}
function GenUser() {


    {/* //// 2.1.1 UseStates | Tracked information ----*/}
     //--User Info Panel
    const [person, setPerson] = useState({
        rank: '1st Lt',
        first_name: 'John',
        last_name: 'Snuffy'
    });
    const [ quals, setQuals ] = useState([
        {role: 'Demo Role A', system: 'Demo System A', is_current: true},
        {role: 'Demo Role B', system: 'Demo System B', is_current: false}
    ])
    const [ certs, setCerts] = useState([
        { certification: 'Cyber Security', is_current: true },
        { certification: 'Demo Cert B', is_current: false },
        { certification: 'Demo Cert C', is_current: true }
    ]);
     //-- Missions Panel
    const [missions, setMissions] = useState([
        {
            id: 1,
            name: 'Mission 1',
            type: 'Training Support',
            dates: '03 - 10 SEP 2026',
            location: 'Fort Bragg, NC',
            oic: 'CPT Demo',
            purpose: 'Short description...',
            requiredCerts: ['CompTIA Security+']
        },
        {
            id: 2,
            name: 'Mission 2',
            type: 'Field Exercise',
            dates: '05 - 07 SEP 2026',
            location: 'Training Area',
            oic: 'MAJ Demo',
            purpose: 'Short description...',
            requiredCerts: ['Comms']
        }
    ]);
    const [openModal, setOpenModal] = useState(null);
    const [roleCerts, setRoleCerts] = useState([
        {
            roleId: 1,
            crew_role: 'Demo Rold A',
            certifications: [
                { certId: 1, certification: 'Cyber Security' },
                { certId: 2, certification: 'Demo Cert B' }
            ]
        }
    ]);
    // Used for crew certifications modal | tells us which role is selected so we know what data to display
    const [selectedRole, setSelectedRole] = useState(null);
    
    
    
    {/* //// 2.1.2 FETCHES/USEEFFECT ---- */}
     //Fetch personal Data
    useEffect(() => {
        fetch(personnelUrl)
            .then((response) => response.json())
            .then((data) => setPerson(data))
            .catch(fetchCatch('Could not load live personnel data, using demo:'));
    }, []);
    //Fetch Qualifications
    useEffect(() => {
        fetch(qualificationsUrl)
            .then((response) => response.json())
            .then((data) => setQuals(data[0]?.qualifications || []))
            .catch(fetchCatch('Could not load qualifications data, using demo:'))
    },[]);
    //Fetch Certifications
    useEffect(() => {
        fetch(certificationsUrl)
            .then((response) => response.json())
            .then((data) => setCerts(data.certifications))
            .catch(fetchCatch('Could not load certifications data, using demo:'));
    }, [])
    //Fetch Crew Role cert requirements
    useEffect(() => {
        const distinctRoles = getDistinctRoles(quals);
        Promise.all(
            distinctRoles.map((role) => 
            fetch(`${SERVER_URL}/crewcerts/${role.roleId}`).then((response) => response.json())
            )
        )
        .then((results) => setRoleCerts(results))
        .catch(fetchCatch('Could not load role certification requirements, using demo:'));
    }, [quals]);
        

        
    {/* ////// 2.1.3 Sub Functions ---- */}
    //Used for Weapons Systems quick info in User Info Panel
    function getDistinctSystems(qualsArray) {
        const systemsMap = {};
        qualsArray.forEach((qual) => {
        if (!systemsMap[qual.systemId]) {
            systemsMap[qual.systemId] = {
                systemId: qual.systemId,
                system: qual.system,
                is_current: qual.is_current,
                qualified_date: qual.qualified_date
            };
        } else {
            systemsMap[qual.systemId].is_current = systemsMap[qual.systemId].is_current && qual.is_current;
            if (qual.qualified_date > systemsMap[qual.systemId].qualified_date) {
                systemsMap[qual.systemId].qualified_date = qual.qualified_date;
            }
        }
    });
    return Object.values(systemsMap);
    }

    const distinctSystems = getDistinctSystems(quals);
    
    const isReady = distinctSystems.every(system => system.is_current)
        && quals.every(qual => qual.is_current)
        && certs.every(cert => cert.is_current);

    /**Populates modals with data
     * 
     * Dependencies:
     * - distinctSystems (dependent on getDistinctSystems)
     */
    function getModalContent(type) {
        if (type === 'systems') {
            return {
                title: 'Weapon Systems',
                items: distinctSystems.map((system) => ({
                    label: system.system,
                    date: system.qualified_date,
                    isCurrent: system.is_current
                }))
            };
        }
        if (type === 'certs') {
            return {
                title: 'Certifications',
                items: certs.map((cert) => ({
                    label: cert.certification,
                    date: cert.expiry_date,
                    isCurrent: cert.is_current
                }))
            };
        }
        return null;
    }

    function getDistinctRoles(qualsArray) {
        const rolesMap = {};
        qualsArray.forEach((qual) => {
            if (!rolesMap[qual.roleId]) {
                rolesMap[qual.roleId] = {
                    roleId: qual.roleId,
                    role: qual.role
                };
            }
        });
        return Object.values(rolesMap);
    }

    //Used for Mission's readiness logic
    function meetsRequirements(mission, certsArray) {
        return mission.requiredCerts.every((required) =>
            certsArray.some((cert) => cert.certification === required && cert.is_current)
        );
    }

    //Collapses a category's Ready/In-Progress/Expired counts into one
    //overall color, used for the compact button indicator dots
    function getCategoryStatus(readyCount, inProgressCount, notStartedCount) {
        if (notStartedCount > 0) return 'bad';
        if (inProgressCount > 0) return 'warn';
        return 'good';
    }

    const systemsStatus = getCategoryStatus(
        distinctSystems.filter((s) => s.is_current).length,
        0,
        distinctSystems.filter((s) => !s.is_current).length
    );
    const rolesStatus = getCategoryStatus(
        quals.filter((q) => q.is_current).length,
        0,
        quals.filter((q) => !q.is_current).length
    );
    const certsStatus = getCategoryStatus(
        certs.filter((c) => c.is_current).length,
        0,
        certs.filter((c) => !c.is_current).length
    );



    //Tasks
    //Cert Tasks
    const certTasks = certs
        .filter((cert) => !cert.is_current)
        .map((cert) => ({
            date: cert.expiry_date,
            task: `Renew ${cert.certification}`
        }));





    const modalContent = openModal && ['systems', 'certs'].includes(openModal.type)
        ? getModalContent(openModal.type)
        : null;






    {/* //// 2.1.4 RETURN ---- */}
    return (

        /**-----Dashboard/Home view-=------------------------ */
        <div className="genUser-dashboard">
            {/**------------User Info Panel---------------- */}
            <div className="user-info user-panel">
                <div className="header">
                    <h3>User Info</h3>
                    <p id="user-status">{isReady ? 'FMC' : 'NMC'}</p>{/**pmc fmc nmc    Not Mission  */}
                </div>
                <p id="rank-name">{person.rank} | {person.last_name}, {person.first_name}</p>
                <div id="domain-unit-crew">Cyber | Unit | <button className="btn-toggle">Alpha</button></div>
                
                {/**Personal Data Panel */}
                <div className="certs">
                    <button
                        className="btn-toggle certs-btn"
                        onClick={() => setOpenModal(
                            openModal?.type === 'systems'
                                ? null
                                : { type: 'systems', systems: distinctSystems }
                        )}
                    >
                        Weapon Systems
                        <span className={`status-dot status-dot-${systemsStatus}`}></span>
                    </button>

                    <button
                        className="btn-toggle certs-btn"
                        onClick={() => setOpenModal(
                            openModal?.type === 'roles'
                                ? null
                                : { type: 'roles' }
                        )}
                    >
                        Crew Roles
                        <span className={`status-dot status-dot-${rolesStatus}`}></span>
                    </button>

                    <button
                        className="btn-toggle certs-btn"
                        onClick={() => setOpenModal(
                            openModal?.type === 'certs'
                                ? null
                                : { type: 'certs', certs }
                        )}
                    >
                        Certifications
                        <span className={`status-dot status-dot-${certsStatus}`}></span>
                    </button>
                </div>
                
                <div className="contact">
                    <div>
                        <h4>Contact Info:</h4>
                        <button className="btn-toggle">Edit</button>
                    </div>
                    <p>Email@example.com</p>
                    <p>Comm:(000)000-0000</p>
                </div>
            </div>
            

            {/**-----------User Mission Panel---------------- */}
            <div className="user-mission-container user-panel">
                <div className="header">
                    <h3>Current Missions</h3>
                    <p className="numX-display missionNum">{missions.length}</p>
                </div>

                <div className="user-missions" >
                    {missions.map((mission) => (
                        <div 
                            className={`mission-card-item ${meetsRequirements(mission, certs) ? '' : 'mission-not-ready'}`} 
                            key={mission.id}
                            onClick={() => setOpenModal(
                                openModal?.type === 'mission' && openModal.mission.id === mission.id 
                                    ? null 
                                    : { type: 'mission', mission }
                                )}
                        >
                            {!meetsRequirements(mission, certs) && (
                                <span className="mission-not-ready-pill">Not Ready</span>
                            )}
                            <h2>{mission.name} - {mission.purpose}</h2>
                            <button className="btn-primary mission-info-btn">
                                More Info
                            </button>
                        </div>
                    ))}

                    <button className="btn-primary">Mission Records</button>
                </div>
            </div>


            {/**-----------User Tasks Panel---------------- */} 
            <div className="user-tasks user-panel">
                <h3>Next Steps</h3>
                <div className="user-tasks-content">
                    <div className="user-tasks-header">
                        <p>Date Due</p>
                        <p>Task</p>
                    </div>

                    {certTasks.map((item, index) => (
                        <div className="user-task btn-card" key={index}>
                            <p className="task-date">{item.date}</p>
                            <p>{item.task}</p>
                            <button className="btn-primary">View</button>
                        </div>
                    ))}
                    
                </div>
            </div>
            
            
            {/* ////// 2.1.4.4 MODALS ----  */}
            {/* //////// 2.1.4.4.1 Selected Mission Modal ---- */}
            {openModal?.type === 'mission' && (
                <div className="mission-modal-backdrop" onClick={() => setOpenModal(null)}>
                    <div className="mission-modal mission-view-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header" id="mv-header">
                            <h2>{openModal.mission.name}</h2>
                            <button onClick={() => setOpenModal(null)}>Close</button>
                        </div>
                        <p id="mv-type">Type: {openModal.mission.type}</p>
                        <p id="mv-dates">Dates: {openModal.mission.dates}</p>
                        <p id="mv-location">Location: {openModal.mission.location}</p>
                        <p id="mv-oic">OIC: {openModal.mission.oic}</p>
                        <p id="mv-purpose">Purpose: {openModal.mission.purpose}</p>
                        <p id="mv-requirements">Requirements: {openModal.mission.requiredCerts.join(', ')}</p>
                    </div>
                </div>
            )}

            {/* //////// 2.1.4.4.2 Certs/Quals/Systems Modal ---- */}
            {modalContent && (
                <div className="mission-modal-backdrop cert-qual-modal" onClick={() => setOpenModal(null)}>
                    <div className="mission-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalContent.title}</h2>
                            <button onClick={() => setOpenModal(null)}>Close</button>
                        </div>
                        {modalContent.items.map((item, index) => (
                            <p key={index} className={item.isCurrent ? '' : 'mission-not-ready'}>
                                {item.label} - {item.date}
                                <span className={item.isCurrent ? 'status-pill-ready' : 'status-pill-expired'}>
                                    {item.isCurrent ? 'Ready' : 'Expired'}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* //////// 2.1.4.4.3 Crew Certifications Modal ---- */}
            {openModal?.type === 'roles' && (
                <div
                    className="mission-modal-backdrop"
                    onClick={() => setOpenModal(null)}
                >
                    <div
                    className="mission-modal crew-cert-modal"
                    onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Crew Certifications</h2>
                            <button onClick={() => setOpenModal(null)}>
                            Close
                            </button>
                        </div>
                        
                        <div className="crew-cert-body">
                            <div className="crew-cert-role-list">
                            {roleCerts.map((role) => {
                                const isSelected =
                                selectedRole?.roleId === role.roleId;
                                return (
                                <p
                                    key={role.roleId}
                                    className={isSelected ? 'role-selected' : ''}
                                    onClick={() =>
                                    setSelectedRole(isSelected ? null : role)
                                    }
                                >
                                    {role.crew_role}
                                </p>
                                );
                            })}
                            </div>

                            <div className="crew-cert-requirements">
                            {selectedRole &&
                                selectedRole.certifications.map((cert) => {
                                const held = certs.some(
                                    (c) =>
                                    c.certification === cert.certification &&
                                    c.is_current
                                );
                                return (
                                    <p key={cert.certId}>
                                    {cert.certification}
                                    <span
                                        className={
                                        held
                                            ? 'status-pill-ready'
                                            : 'status-pill-expired'
                                        }
                                    >
                                        {held ? 'Ready' : 'Missing'}
                                    </span>
                                    </p>
                                );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>






    )//Closes return
}



export default GenUser;