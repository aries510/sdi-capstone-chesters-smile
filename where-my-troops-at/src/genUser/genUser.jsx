import './genUser.css';
import { useState, useEffect } from 'react';




/** ####################################
 * Variables for production 
##########################################*/
function fetchCatch(message){
    return (error) => console.log(message, error);
}
//server routes
const serverUrl = 'localhost:8080';
    // personnel link | replace with personnel_id after table is updated
    const personnelId = 1;

    const personnelUrl = `http://${serverUrl}/personnel/${personnelId}`;
    const certificationsUrl = `http://${serverUrl}/perscerts/${personnelId}`;
    const qualificationsUrl =`http://${serverUrl}/quals/${personnelId}`;


/** ####################################
 * Functions 
#########################################*/
function GenUser() {


    //UseStates | Tracked information
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
        { certification: 'Demo Cert A', is_current: true },
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
            requiredCerts: ['Cyber Security']
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
    const [selectedMission, setSelectedMission] = useState(null);

    
    
    
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
    //used for Weapons Systems quick info in User Info Panel
    function getDistinctSystems(qualsArray) {
        const systemsMap = {};
        qualsArray.forEach((qual) => {
        if (!systemsMap[qual.systemId]) {
            systemsMap[qual.systemId] = {
                systemId: qual.systemId,
                system: qual.system,
                is_current: qual.is_current
            };
        } else {
            systemsMap[qual.systemId].is_current = systemsMap[qual.systemId].is_current && qual.is_current;
        }
    });
    return Object.values(systemsMap);
    }
    const distinctSystems = getDistinctSystems(quals);
    
    const isReady = distinctSystems.every(system => system.is_current)
        && quals.every(qual => qual.is_current)
        && certs.every(cert => cert.is_current);


    function meetsRequirements(mission, certsArray) {
        return mission.requiredCerts.every((required) =>
            certsArray.some((cert) => cert.certification === required && cert.is_current)
        );
    }


    /**################
     * Return
     ##################*/
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
                <div id="domain-unit-crew">Cyber | Unit | <button className="btn-card">Alpha</button></div>
                
                {/**Personal Data Panel */}
                <div className="certs">
                    <div></div>{/**Empty cell for spacing */}

                    {/**Table Headers */}
                    <p className="cert-header">FMC</p>
                    <p className="cert-header">PMC</p>
                    <p className="cert-header">Expired</p>

                    {/**Weapon Systems Certified on */}
                    <button className="btn-card certs-btn">Weapon Systems</button>
                    <p className="user-cert-ready numX-display">{distinctSystems.filter(system => system.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{distinctSystems.filter(system => !system.is_current).length}</p>

                    {/**Qualifications held */}
                    <button className="btn-card certs-btn">Qualifications</button>
                    <p className="user-cert-ready numX-display">{quals.filter(qual => qual.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{quals.filter(qual => !qual.is_current).length}</p>

                    {/**Certifications Held */}
                    <button className="btn-card certs-btn">Certifications</button>
                    <p className="user-cert-ready numX-display">{certs.filter(cert => cert.is_current).length}</p>
                    <p className="user-cert-inprogress numX-display">0</p>
                    <p className="user-cert-notstarted numX-display">{certs.filter(cert => !cert.is_current).length}</p>
                </div>
                
                <div className="contact">
                    <div>
                        <h4>Contact Info:</h4>
                        <button className="btn-card">Edit</button>
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

                <div className="user-missions">
                    {missions.map((mission) => (
                        <div 
                            className={`mission-name-desc btn-card ${meetsRequirements(mission, certs) ? '' : 'mission-not-ready'}`} 
                            key={mission.id}
                        >
                            <h2>{mission.name} - {mission.purpose}</h2>
                            <button className="view-btn" 
                            onClick={() => setSelectedMission(selectedMission?.id === mission.id ? null : mission)}
                            >
                                view
                            </button>
                        </div>
                    ))}

                    <button className="view-btn">Mission Records</button>
                </div>
                {/**Selected Mission Modal */}
                {selectedMission && (
                    <div className="mission-modal-backdrop" onClick={() => setSelectedMission(null)}>
                        <div className="mission-modal" onClick={(event) => event.stopPropagation()}>
                            <h2>{selectedMission.name}</h2>
                            <p>{selectedMission.type}</p>
                            <p>{selectedMission.dates}</p>
                            <p>{selectedMission.location}</p>
                            <p>{selectedMission.oic}</p>
                            <p>{selectedMission.purpose}</p>
                            <p>Required: {selectedMission.requiredCerts.join(', ')}</p>
                            <button onClick={() => setSelectedMission(null)}>Close</button>
                        </div>
                    </div>
                )}
            </div>


            {/**-----------User Tasks Panel---------------- */} 
            <div className="user-tasks user-panel">
                <h3>Next Steps</h3>
                <div className="user-tasks-content">
                    <div className="user-tasks-header">
                    <p>Date Due</p>
                    <p>Task</p>
                    </div>

                    <div className="user-task btn-card">
                        <p className="task-date">YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button className="view-btn">View</button>
                    </div>

                    <div className="user-task btn-card">
                        <p className="task-date">YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button className="view-btn">View</button>
                    </div>

                    <div className="user-task btn-card">
                        <p className="task-date">YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button className="view-btn">View</button>
                    </div>
                </div>
            </div>
            
            
        </div>



    )
}



export default GenUser;