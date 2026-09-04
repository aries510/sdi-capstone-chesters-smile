import './genUser.css';

function GenUser() {



    return (

        /**-----------------------Dashboard/Home view-=--------------------------- */
        <div className="genUser-dashboard">

            {/**-----------User Info Panel---------------- */}
            <div className="user-info">
                <h3>User Info</h3> <p id="user-status">Not Ready</p>
                <p id="rank-name">1st lt - Snuffy, John</p>
                <p id="domain-unit-crew">Cyber | Unit | Alpha</p>
                
                <div className="certs">
                    <div></div>{/**Empty cell for spacing */}
                    <p>Ready</p>
                    <p>In-Progress</p>
                    <p>Not Started</p>
                    <button>Weapon Systems</button>
                    <p className="user-cert-ready">1</p>
                    <p className="user-cert-inprogress">2</p>
                    <p className="user-cert-notstarted">3</p>

                    <button>Qualifications</button>
                    <p className="user-cert-ready">3</p>
                    <p className="user-cert-inprogress">1</p>
                    <p className="user-cert-notstarted">0</p>

                    <button>Certifications</button>
                    <p className="user-cert-ready">1</p>
                    <p className="user-cert-inprogress">2</p>
                    <p className="user-cert-notstarted">0</p>
                </div>

                <div className="contact">
                    <h4>Contact Info:</h4>
                    <button>Edit</button>
                    <p>Email@example.com</p>
                    <p>Comm:(000)000-0000</p>
                </div>
            </div>
            

            {/**-----------User Mission Panel---------------- */}
            <div className="user-mission-container">
                <h3>Current Missions</h3>
                <p>2</p>

                <div className="user-missions">
                    <div className="mission-name-desc">
                        <h2>Mission 1 - Short Description...</h2>
                        <button>view</button>
                    </div>

                    <div className="mission-name-desc">
                        <h2>Mission 2 - Short Description...</h2>
                        <button>view</button>
                    </div>

                    <button>Mission Records</button>
                </div>
            </div>


            {/**-----------User Tasks Panel---------------- */} 
            <div className="user-tasks">
                <h3>Next Steps</h3>
                <div className="user-tasks-content">
                    <p>Date Due</p>   <p>Task</p>

                    <div className="user-task">
                        <p>YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button>View</button>
                    </div>

                    <div className="user-task">
                        <p>YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button>View</button>
                    </div>

                    <div className="user-task">
                        <p>YYYY/MM/DD</p> <p>Renew Weapon 1 Cert</p> <button>View</button>
                    </div>
                </div>
            </div>
            
            
        </div>



    )
}



export default GenUser;