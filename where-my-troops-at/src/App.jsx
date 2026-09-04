import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login/Login.jsx';
import AdminHome from './AdminHome.jsx';
import EvaluatorsPanel from './EvaluatorsPanel';
import MPC from "./planning/MPC.jsx";

function App() {


  return (
    <div className="main">
      <h1>WMTA</h1>
      <Routes>
        <Route path='/' element={<Login />}></Route>

        {/* <Route path='/GeneralUser' element={<GeneralUser />}></Route> */}
        <Route path='/Admin' element={<AdminHome />}></Route>
        <Route path='/Evaluator' element={<EvaluatorsPanel />}></Route>
        <Route path="/MPC" element={<MPC />} />
      </Routes>
    </div>
  )
}

export default App
