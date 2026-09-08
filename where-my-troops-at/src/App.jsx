import { Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './Login/LoginPage.jsx';
import AdminHome from './AdminHome.jsx';
import EvaluatorsPanel from './EvaluatorsPanel';
import CreateAccount from './Login/CreateAccount';
import ProtectedRoute from './ProtectedRoute';
import GenUser from './genUser/genUser.jsx';

function App() {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>

        {/* <Route path='/GeneralUser' element={<GeneralUser />}></Route> */}

        <Route path="/Admin" element={<AdminHome />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_admin" />}>
          <Route path="/Admin" element={<AdminHome />}></Route>
        </Route> */}

        <Route path="/Admin/CreateAccount" element={<CreateAccount />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_admin" />}>
          <Route path="/Admin/CreateAccount" element={<CreateAccount />}></Route>
        </Route> */}

        <Route path="/Evaluator" element={<EvaluatorsPanel />}></Route>
        {/* Uncomment below to require a login to the page */}
        {/* <Route element={<ProtectedRoute role="is_evaluator" />}>
          <Route path="/Evaluator" element={<EvaluatorsPanel />}></Route>
        </Route> */}

        <Route path='/GeneralUser' element={<GenUser />}></Route>
        <Route path='/Admin' element={<AdminHome />}></Route>
        <Route path='/Evaluator' element={<EvaluatorsPanel />}></Route>
        {/* <Route path='/MPC' element={<Mpc />}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
