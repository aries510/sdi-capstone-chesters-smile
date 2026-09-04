import { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';


const loginUrl = 'http://localhost:8080/login';

function Login() {
    const navigate = useNavigate(); 
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    })
    const [loginError, setLoginError] = useState('');


    async function handleSubmit(event) {
        event.preventDefault();
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
        if (!response.ok) {
            setLoginError('Invalid Credentials, try again!')
            return;
        }
        const user = await response.json()
        
        if (user.is_admin) {navigate('/Admin')}
        else if (user.is_evaluator) {navigate('/Evaluator')}
        else if (user.is_planner) {navigate('/MPC')}
        else {navigate('/GeneralUser')}

    }


    return (
        <div className="main">
            <h1>Login</h1>
            {loginError && <p>{loginError}</p>}
            <form onSubmit={handleSubmit} >
                <input type="text" value={loginData.username} onChange={(event) => setLoginData({...loginData, username: event.target.value})} placeholder="Enter Email Address"/>

                <input type="password" value={loginData.password} onChange={(event) => setLoginData({...loginData, password: event.target.value})} placeholder="Enter Password" />


                <button type="submit" >Log In</button>
            </form>

        </div>
    )
}


export default Login;