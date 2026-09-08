import './genUser.css';
import { useState, useEffect } from 'react';

function GenUser() {













    return (

        /**-----------------------Dashboard/Home view-=--------------------------- */
        <div className="genUser-dashboard">

            {/**-----------User Info Panel---------------- */}
            <div className="user-info user-panel">
                <div className="header">
                    <h3>User Info</h3>
                    <p id="user-status">Not Ready</p>{/**pmc fmc nmc    Not Mission  */}
                </div>
                <p id="rank-name">1st lt - Snuffy, John</p>
                <div id="domain-unit-crew">Cyber | Unit | <button className="btn-card">Alpha</button></div>
                
                <div className="certs">
                    <div></div>{/**Empty cell for spacing */}
                    <p className="cert-header">Ready</p>
                    <p className="cert-header">In-Progress</p>
                    <p className="cert-header">Not Started</p>
                    <button className="btn-card certs-btn">Weapon Systems</button>
                    <p className="user-cert-ready numX-display">1</p>
                    <p className="user-cert-inprogress numX-display">2</p>
                    <p className="user-cert-notstarted numX-display">3</p>

                    <button className="btn-card certs-btn">Qualifications</button>
                    <p className="user-cert-ready numX-display">3</p>
                    <p className="user-cert-inprogress numX-display">1</p>
                    <p className="user-cert-notstarted numX-display">0</p>

                    <button className="btn-card certs-btn">Certifications</button>
                    <p className="user-cert-ready numX-display">1</p>
                    <p className="user-cert-inprogress numX-display">2</p>
                    <p className="user-cert-notstarted numX-display">0</p>
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
                    <p className="numX-display missionNum">2</p>
                </div>

                <div className="user-missions">
                    <div className="mission-name-desc btn-card">
                        <h2>Mission 1 - Short Description...</h2>
                        <button className="view-btn">view</button>
                    </div>

                    <div className="mission-name-desc btn-card">
                        <h2>Mission 2 - Short Description...</h2>
                        <button className="view-btn">view</button>
                    </div>

                    <button className="view-btn">Mission Records</button>
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