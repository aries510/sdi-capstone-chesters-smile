import { useState } from 'react';
import { Route, Routes, useNavigate} from 'react-router-dom';
import './App.css';


function App() {


  return (
    <div className="main">
      <h1>WMTA</h1>
      <Routes>
        <Route path='/' element={<Login />}></Route>

        <Route path='/GeneralUser' element={<GeneralUser />}></Route>
        <Route path='/Admin' element={<Admin />}></Route>
        <Route path='/Evaluator' element={<Evaluator />}></Route>
        <Route path='/MPC' element={<Mpc />}></Route>
      </Routes>
    </div>
  )
}

export default App
