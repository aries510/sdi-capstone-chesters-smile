import './genUser.css';
import { useState, useEffect } from 'react';
import Navbar from '../Navbar';




/** ####################################
 * Variables for production 
##########################################*/
function fetchCatch(message){
    return (error) => console.log(message, error);
}
//server routes
const serverUrl = 'localhost:8080';

    /**
     * PERSONNEL LINK
     * Hardcoded to personnel id 1 for demo
     * 
     * Production Solution:
     * 1. POST /login needs personnel_id added to its response
     *  - currently exists on users, just isn't returned
     * 2. Some sort of AuthContext wrapper for persistent access
    */
    const personnelId = 1;

    const personnelUrl = `http://${serverUrl}/personnel/${personnelId}`;
    const certificationsUrl = `http://${serverUrl}/perscerts/${personnelId}`;
    const qualificationsUrl =`http://${serverUrl}/quals/${personnelId}`;


/** ####################################
 * Functions 
#########################################*/
function GenUser() {


    /**----------UseStates | Tracked information----------------*/
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

    
    
    
    /**----- Fetches to Gather data ------------- */
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
        

        
    /**---- Sub Functions ------------------------ */
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
    console.log(distinctSystems);
    
    const isReady = distinctSystems.every(system => system.is_current)
        && quals.every(qual => qual.is_current)
        && certs.every(cert => cert.is_current);

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
        if (type === 'quals') {
            return {
                title: 'Crew Quals',
                items: quals.map((qual) => ({
                    label: `${qual.role} - ${qual.system}`,
                    date: qual.qualified_date,
                    isCurrent: qual.is_current
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



    //Used for Mission's readiness logic
    function meetsRequirements(mission, certsArray) {
        return mission.requiredCerts.every((required) =>
            certsArray.some((cert) => cert.certification === required && cert.is_current)
        );
    }



    //Tasks
    //Cert Tasks
    const certTasks = certs
        .filter((cert) => !cert.is_current)
        .map((cert) => ({
            date: cert.expiry_date,
            task: `Renew ${cert.certification}`
        }));



    const modalContent = openModal && ['systems', 'quals', 'certs'].includes(openModal.type)
        ? getModalContent(openModal.type)
        : null;

    /**##########################
     * Return
     #############################*/
    return (

        /**-----Dashboard/Home view-=------------------------ */
        <>
        <Navbar />
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
                    <div></div>{/**Empty cell for spacing */}

                    {/**Table Headers */}
                    <p className="cert-header">FMC</p>
                    <p className="cert-header">PMC</p>
                    <p className="cert-header">Expired</p>

                    {/**Weapon Systems Certified on */}
                    <button className="btn-toggle certs-btn" onClick={() => setOpenModal(
                        openModal?.type === 'systems' 
                            ? null
                            : { type: 'systems', systems: distinctSystems }
                        )}
                    >
                        Weapon Systems
                    </button>
                    <p className="user-cert-ready numX-display">{distinctSystems.filter(system => system.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{distinctSystems.filter(system => !system.is_current).length}</p>

                    {/**Qualifications held */}
                    <button className="btn-toggle certs-btn" onClick={() => setOpenModal(
                        openModal?.type === 'quals'
                            ? null
                            : { type: 'quals', quals }
                        )}
                    >
                        Crew Quals
                    </button>
                    <p className="user-cert-ready numX-display">{quals.filter(qual => qual.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{quals.filter(qual => !qual.is_current).length}</p>

                    {/**Certifications Held */}
                    <button className="btn-toggle certs-btn" onClick={() => setOpenModal(
                        openModal?.type === 'certs'
                            ? null
                            : { type: 'certs', certs }
                        )}
                    >
                        Certifications
                    </button>
                    <p className="user-cert-ready numX-display">{certs.filter(cert => cert.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{certs.filter(cert => !cert.is_current).length}</p>
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
            
            
            {/** MODALS ################################### */}
            {/**Selected Mission Modal */}
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

            {/**Certs/Quals/Systems Modal */}
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


        </div>






    </>
    )//Closes return
}



export default GenUser;